"use client";

import { useMutation } from "@tanstack/react-query";
import { FileImage, FileText, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UploadedFile {
  id: number;
  filename: string;
  originalName: string;
  filePath: string;
  fileType: string;
}

interface FileUploadProps {
  transactionId?: number;
  onUploadSuccess?: (file: UploadedFile) => void;
  accept?: string;
  maxSizeText?: string;
}

// Image compression utility
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions (max 1920px width/height)
      let { width, height } = img;
      const maxDimension = 1920;

      if (width > height) {
        if (width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error("Compression failed"));
          }
        },
        file.type,
        0.8, // 80% quality
      );
    };

    img.onerror = () => reject(new Error("Image load failed"));
    img.src = URL.createObjectURL(file);
  });
};

export default function FileUpload({
  transactionId,
  onUploadSuccess,
  accept = "image/*,.pdf",
  maxSizeText = "Max 5MB",
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      if (transactionId) {
        formData.append("transactionId", transactionId.toString());
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log("File uploaded successfully:", data.file.originalName);
      alert(`File uploaded successfully: ${data.file.originalName}`);
      onUploadSuccess?.(data.file);
      resetUpload();
    },
    onError: (error: Error) => {
      console.error("Upload failed:", error.message);
      alert(`Upload failed: ${error.message}`);
    },
  });

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic client-side validation
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Please select a file smaller than 5MB.");
      return;
    }

    let processedFile = file;

    // Compress images before upload
    if (file.type.startsWith("image/") && file.size > 1024 * 1024) {
      // > 1MB
      try {
        processedFile = await compressImage(file);
      } catch (error) {
        console.warn("Image compression failed, using original file:", error);
      }
    }

    setSelectedFile(processedFile);

    // Create preview for images
    if (processedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(processedFile);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    uploadMutation.mutate(selectedFile);
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <FileImage className="h-8 w-8 text-primary" />;
    }
    if (file.type === "application/pdf") {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <Upload className="h-8 w-8 text-gray-500" />;
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Upload File</h3>
            <p className="text-sm text-muted-foreground">
              {accept.replace(/\*/g, "").replace(/,/g, " or ")} • {maxSizeText}
            </p>
          </div>

          {!selectedFile ? (
            // biome-ignore lint/a11y/useKeyWithClickEvents: <>
            // biome-ignore lint/a11y/useSemanticElements: <>
            <div
              role="button"
              tabIndex={0}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600">
                Click to select or drag and drop
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {preview ? (
                  // biome-ignore lint/performance/noImgElement: <>
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-12 w-12 object-cover rounded"
                  />
                ) : (
                  getFileIcon(selectedFile)
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetUpload}
                  disabled={uploadMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="w-full"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload File"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
