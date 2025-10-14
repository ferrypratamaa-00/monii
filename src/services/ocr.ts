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

    // Extract amount patterns (various currency formats)
    const amountPatterns = [
      /total\s*:?\s*\$?(\d+(?:\.\d{2})?)/i,
      /amount\s*:?\s*\$?(\d+(?:\.\d{2})?)/i,
      /\$(\d+(?:\.\d{2})?)/,
      /rp\.?\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/i,
      /idr\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/i,
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

    // Extract date patterns
    const datePatterns = [
      /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/,
      /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/,
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{4})/i,
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
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock OCR results based on common receipt patterns
    const mockResults: OCRResult[] = [
      { text: "STARBUCKS", confidence: 0.95 },
      { text: "123 Main St", confidence: 0.9 },
      { text: "Date: 12/15/2024", confidence: 0.92 },
      { text: "Grande Latte", confidence: 0.88 },
      { text: "$5.75", confidence: 0.96 },
      { text: "Tax: $0.43", confidence: 0.89 },
      { text: "Total: $6.18", confidence: 0.98 },
    ];

    return {
      success: true,
      data: mockResults,
    };
  }
}
