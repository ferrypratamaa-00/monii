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

export class OCRService {
  /**
   * Extract text from receipt image using OCR
   */
  static async extractText(imageData: string): Promise<OCRResponse> {
    try {
      // Remove data URL prefix if present
      const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, "");

      // For demo purposes, we'll use a mock OCR service
      // In production, you would integrate with Google Vision API or similar
      const mockResponse = await OCRService.mockOCRCall(base64Image);

      return OCRResponseSchema.parse(mockResponse);
    } catch (error) {
      console.error("OCR extraction failed:", error);
      return {
        success: false,
        error: "Failed to extract text from image",
      };
    }
  }

  /**
   * Parse OCR text to extract receipt information
   */
  static parseReceiptData(ocrResults: OCRResult[]): ParsedReceipt {
    const fullText = ocrResults
      .filter((result) => result.confidence > 0.7) // Only use high-confidence results
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
        const extractedAmount = parseFloat(match[1].replace(/,/g, ""));
        if (!Number.isNaN(extractedAmount) && extractedAmount > 0) {
          amount = extractedAmount;
          break;
        }
      }
    }

    // Extract date patterns (Indonesian date formats)
    const datePatterns = [
      /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/,
      /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/,
      /tanggal\s*:?\s*(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/i,
      /date\s*:?\s*(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/i,
    ];

    let date: string | null = null;
    for (const pattern of datePatterns) {
      const match = fullText.match(pattern);
      if (match) {
        // Simple date parsing - in production, use a proper date library
        try {
          const parsedDate = new Date(match[0]);
          if (!Number.isNaN(parsedDate.getTime())) {
            date = parsedDate.toISOString().split("T")[0];
            break;
          }
        } catch {
          // Continue to next pattern
        }
      }
    }

    // Extract vendor name (usually at the top of the receipt)
    const lines = fullText.split("\n").filter((line) => line.trim().length > 0);
    let vendor: string | null = null;

    // Look for vendor patterns in the first few lines
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i].trim();
      // Skip if it looks like an address or phone number
      if (!/\d{3,}/.test(line) && line.length > 2 && line.length < 50) {
        vendor = line.charAt(0).toUpperCase() + line.slice(1);
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
   * In production, replace with actual OCR API call
   */
  private static async mockOCRCall(_base64Image: string): Promise<OCRResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

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

    console.log("OCR Mock Service: Processing receipt image");
    console.log("Mock OCR Results:", mockResults);

    return {
      success: true,
      data: mockResults,
    };
  }
}
