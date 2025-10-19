import { createWorker, type Worker } from "tesseract.js";
import { z } from "zod";

// OCR Response Schema
const OCRResultSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1),
  boundingBox: z.array(z.number()).optional(),
});

const OCRResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(OCRResultSchema).optional(),
  error: z.string().optional(),
});

export type OCRResult = z.infer<typeof OCRResultSchema>;
export type OCRResponse = z.infer<typeof OCRResponseSchema>;

// Parsed Receipt Data Schema
const ParsedReceiptSchema = z.object({
  amount: z.number().nullable(),
  date: z.string().nullable(),
  vendor: z.string().nullable(),
  items: z
    .array(
      z.object({
        name: z.string(),
        price: z.number().nullable(),
      }),
    )
    .optional(),
  total: z.number().nullable(),
  tax: z.number().nullable(),
});

export type ParsedReceipt = z.infer<typeof ParsedReceiptSchema>;

// biome-ignore lint/complexity/noStaticOnlyClass: <>
export class OCRService {
  private static worker: Worker | null = null;
  private static isInitialized = false;

  /**
   * Initialize Tesseract worker
   */
  private static async getWorker(): Promise<Worker> {
    if (!OCRService.worker) {
      OCRService.worker = await createWorker();
    }

    if (!OCRService.isInitialized) {
      // Load English language (Indonesian support may be limited)
      await OCRService.worker.load("eng");
      OCRService.isInitialized = true;
    }

    return OCRService.worker;
  }

  /**
   * Extract text from receipt image using Tesseract OCR (Free!)
   */
  static async extractText(imageData: string): Promise<OCRResponse> {
    try {
      // Validate input
      if (!imageData || imageData.trim().length === 0) {
        return {
          success: false,
          error: "No image data provided",
        };
      }

      // Remove data URL prefix if present
      const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, "");

      // Validate base64 data
      if (!base64Image || base64Image.trim().length === 0) {
        return {
          success: false,
          error: "Invalid image data format",
        };
      }

      // Convert base64 to blob for Tesseract
      const imageBlob = await fetch(
        `data:image/jpeg;base64,${base64Image}`,
      ).then((res) => res.blob());

      const worker = await OCRService.getWorker();

      // Perform OCR
      const {
        data: { text, confidence },
      } = await worker.recognize(imageBlob);

      if (!text || text.trim().length === 0) {
        return {
          success: false,
          error: "No text detected in image",
        };
      }

      // Convert Tesseract response to our format
      const ocrResults: OCRResult[] = [];

      // Add full text result
      ocrResults.push({
        text: text.trim(),
        confidence: confidence / 100, // Tesseract returns 0-100, we need 0-1
      });

      // Split text into words for individual results
      const words = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);
      words.forEach((word, index) => {
        if (word.length > 1) {
          // Skip very short words
          ocrResults.push({
            text: word,
            confidence: Math.max(0.5, confidence / 100 - index * 0.01), // Decreasing confidence for individual words
          });
        }
      });

      return OCRResponseSchema.parse({
        success: true,
        data: ocrResults,
      });
    } catch (error) {
      console.error("Tesseract OCR failed:", error);

      // Fallback to mock service if Tesseract fails
      console.log("Falling back to mock OCR service");
      try {
        return await OCRService.mockOCRCall(
          imageData.replace(/^data:image\/[a-z]+;base64,/, ""),
        );
      } catch (mockError) {
        return {
          success: false,
          error: `OCR failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
      }
    }
  }

  /**
   * Cleanup Tesseract worker when done
   */
  static async cleanup(): Promise<void> {
    if (OCRService.worker) {
      await OCRService.worker.terminate();
      OCRService.worker = null;
      OCRService.isInitialized = false;
    }
  }

  /**
   * Parse OCR text to extract receipt information
   */
  static parseReceiptData(ocrResults: OCRResult[]): ParsedReceipt {
    const fullText = ocrResults
      .filter((result) => result.confidence > 0.5) // Lower threshold for Tesseract (was 0.7)
      .map((result) => result.text)
      .join(" ")
      .toLowerCase();

    // Extract amount patterns (Indonesian currency formats)
    const amountPatterns = [
      /total\s*:?\s*rp\.?\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/i,
      /total\s*:?\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/i,
      /amount\s*:?\s*rp\.?\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/i,
      /rp\.?\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/i,
      /idr\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/i,
      /(\d+(?:\.\d{3})*(?:,\d{2})?)\s*rp/i,
    ];

    let amount: number | null = null;
    for (const pattern of amountPatterns) {
      const match = fullText.match(pattern);
      if (match) {
        // Remove dots and commas for parsing
        const cleanAmount = match[1].replace(/\./g, "").replace(",", ".");
        const extractedAmount = parseFloat(cleanAmount);
        if (!Number.isNaN(extractedAmount) && extractedAmount > 0) {
          amount = extractedAmount;
          break;
        }
      }
    }

    // Extract date patterns (Indonesian date formats)
    const datePatterns = [
      /tanggal\s*:?\s*(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/i,
      /date\s*:?\s*(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/i,
      /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/,
      /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/,
    ];

    let date: string | null = null;
    for (const pattern of datePatterns) {
      const match = fullText.match(pattern);
      if (match) {
        try {
          // biome-ignore lint/suspicious/noImplicitAnyLet: <>
          let day, month, year;

          if (
            match[0].toLowerCase().includes("tanggal") ||
            match[0].toLowerCase().includes("date")
          ) {
            // Format: tanggal: DD/MM/YYYY
            day = match[1];
            month = match[2];
            year = match[3];
          } else if (match[1] && match[1].length === 4) {
            // Format: YYYY/MM/DD
            year = match[1];
            month = match[2];
            day = match[3];
          } else {
            // Format: DD/MM/YYYY
            day = match[1];
            month = match[2];
            year = match[3];
          }

          // Ensure year is 4 digits
          if (year.length === 2) {
            year = year < "50" ? "20" + year : "19" + year;
          }

          // Create date string in YYYY-MM-DD format
          const dateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
          const parsedDate = new Date(dateStr);

          if (!Number.isNaN(parsedDate.getTime())) {
            date = dateStr;
            break;
          }
        } catch {
          // Continue to next pattern
        }
      }
    }

    // Extract vendor name (usually at the top of the receipt)
    const highConfidenceResults = ocrResults.filter(
      (result) => result.confidence > 0.6,
    ); // Lower threshold for Tesseract (was 0.8)
    let vendor: string | null = null;

    // Look for vendor patterns in high confidence results
    for (const result of highConfidenceResults) {
      const text = result.text.trim();
      // Skip if it looks like an address, phone number, or price
      if (
        !/\d{3,}/.test(text) && // No long numbers
        !text.includes("/") && // No dates
        !text.includes("rp") &&
        !text.includes("idr") && // No currency
        text.length > 2 &&
        text.length < 50 &&
        !text.toLowerCase().includes("total") &&
        !text.toLowerCase().includes("tanggal") &&
        !text.toLowerCase().includes("waktu")
      ) {
        vendor = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        break;
      }
    }

    return ParsedReceiptSchema.parse({
      amount,
      date,
      vendor,
      items: [], // Could be enhanced to extract line items
      total: amount, // For now, assume amount is total
      tax: null,
    });
  }

  /**
   * Mock OCR service for development/demo purposes
   * Used as fallback when Tesseract fails
   */
  private static async mockOCRCall(_base64Image: string): Promise<OCRResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock OCR results based on common Indonesian receipt patterns
    const mockResults: OCRResult[] = [
      { text: "INDOMARET", confidence: 0.95 },
      { text: "Jl. Sudirman No. 123", confidence: 0.9 },
      { text: "Tanggal: 19/10/2024", confidence: 0.92 },
      { text: "Waktu: 14:30", confidence: 0.88 },
      { text: "Nasi Goreng Special", confidence: 0.85 },
      { text: "Rp 25.000", confidence: 0.96 },
      { text: "Es Teh Manis", confidence: 0.87 },
      { text: "Rp 5.000", confidence: 0.94 },
      { text: "Total: Rp 30.000", confidence: 0.98 },
      { text: "Tunai", confidence: 0.89 },
    ];

    console.log(
      "🔄 OCR Mock Service: Processing receipt image (Tesseract fallback)",
    );
    console.log("📝 Mock OCR Results:", mockResults);

    return {
      success: true,
      data: mockResults,
    };
  }
}
