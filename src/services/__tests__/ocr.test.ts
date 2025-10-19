import { describe, it, expect, vi, beforeEach, afterEach, MockedFunction } from "vitest";
import { OCRService } from "../ocr";
import { createWorker } from "tesseract.js";

// Mock tesseract.js
vi.mock("tesseract.js", () => ({
  createWorker: vi.fn(),
}));

// Get the mocked function
const mockCreateWorker = createWorker as MockedFunction<typeof createWorker>;

// Mock fetch for blob conversion
global.fetch = vi.fn();

describe("OCRService", () => {
  beforeEach(() => {
    // Reset worker state
    OCRService["worker"] = null;
    OCRService["isInitialized"] = false;

    // Mock fetch for blob conversion
    (global.fetch as any).mockResolvedValue({
      blob: vi.fn().mockResolvedValue(new Blob()),
    });
  });

  afterEach(async () => {
    // Cleanup worker after each test
    await OCRService.cleanup();
  });

  describe("extractText", () => {
    it("should extract text from a valid image", async () => {
      // Mock Tesseract worker
      const mockWorker = {
        load: vi.fn().mockResolvedValue(undefined),
        recognize: vi.fn().mockResolvedValue({
          data: {
            text: "INDOMARET\nTotal: Rp 25.000\nTanggal: 19/10/2024",
            confidence: 85,
          },
        }),
        terminate: vi.fn().mockResolvedValue(undefined),
      };

      mockCreateWorker.mockResolvedValue(mockWorker);

      const base64Image = "data:image/jpeg;base64,fakeImageData";

      const result = await OCRService.extractText(base64Image);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      // biome-ignore lint/style/noNonNullAssertion: <>
      expect(result.data!.length).toBeGreaterThan(0);
      expect(result.data![0].text).toContain("INDOMARET");
    });

    it("should handle OCR failure and fallback to mock", async () => {
      // Mock Tesseract worker to fail
      const mockWorker = {
        load: vi.fn().mockRejectedValue(new Error("Tesseract failed")),
        terminate: vi.fn().mockResolvedValue(undefined),
      };

      mockCreateWorker.mockResolvedValue(mockWorker);

      const base64Image = "data:image/jpeg;base64,fakeImageData";

      const result = await OCRService.extractText(base64Image);

      // Should fallback to mock service
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.some(item => item.text.includes("INDOMARET"))).toBe(true);
    });

    it("should return error for invalid image data", async () => {
      const result = await OCRService.extractText("");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("parseReceiptData", () => {
    it("should parse receipt data correctly", () => {
      const ocrResults = [
        { text: "INDOMARET", confidence: 0.95 },
        { text: "Total: Rp 25.000", confidence: 0.92 },
        { text: "Tanggal: 19/10/2024", confidence: 0.88 },
      ];

      const result = OCRService.parseReceiptData(ocrResults);

      expect(result.vendor).toBe("Indomaret");
      expect(result.amount).toBe(25000);
      expect(result.date).toBe("2024-10-19");
    });

    it("should handle missing data gracefully", () => {
      const ocrResults = [
        { text: "Some random text", confidence: 0.5 },
      ];

      const result = OCRService.parseReceiptData(ocrResults);

      expect(result.vendor).toBeNull();
      expect(result.amount).toBeNull();
      expect(result.date).toBeNull();
    });

    it("should parse Indonesian currency formats", () => {
      const ocrResults = [
        { text: "Total: Rp 15.500", confidence: 0.9 },
        { text: "Rp 15.500,00", confidence: 0.85 },
        { text: "IDR 15500", confidence: 0.8 },
      ];

      const result1 = OCRService.parseReceiptData([ocrResults[0]]);
      const result2 = OCRService.parseReceiptData([ocrResults[1]]);
      const result3 = OCRService.parseReceiptData([ocrResults[2]]);

      expect(result1.amount).toBe(15500);
      expect(result2.amount).toBe(15500);
      expect(result3.amount).toBe(15500);
    });
  });

  describe("cleanup", () => {
    it("should cleanup worker properly", async () => {
      // Initialize worker first
      const mockWorker = {
        load: vi.fn().mockResolvedValue(undefined),
        terminate: vi.fn().mockResolvedValue(undefined),
      };

      mockCreateWorker.mockResolvedValue(mockWorker);

      // Get worker to initialize it
      await OCRService["getWorker"]();

      // Cleanup
      await OCRService.cleanup();

      expect(OCRService["worker"]).toBeNull();
      expect(OCRService["isInitialized"]).toBe(false);
    });
  });
});