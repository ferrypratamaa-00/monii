import { z } from "zod";

// File upload validation
export const FileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size must be less than 5MB",
    })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
          file.type,
        ),
      {
        message: "Only JPEG, PNG, WebP images and PDF files are allowed",
      },
    ),
});

export const UploadReceiptSchema = z.object({
  transactionId: z.number().optional(),
  fileType: z.enum(["receipt", "avatar"]).default("receipt"),
});

// File validation helpers
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: "File size must be less than 5MB" };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: "Only JPEG, PNG, WebP images and PDF files are allowed",
    };
  }

  return { isValid: true };
}

export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop();
  return `${timestamp}-${random}.${extension}`;
}
