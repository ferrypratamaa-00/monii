import { toast as sonnerToast } from "sonner";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class Toast {
  success(message: string, options?: ToastOptions) {
    return sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action,
    });
  }

  error(message: string, options?: ToastOptions) {
    return sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration ?? 5000,
      action: options?.action,
    });
  }

  warning(message: string, options?: ToastOptions) {
    return sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action,
    });
  }

  info(message: string, options?: ToastOptions) {
    return sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action,
    });
  }

  // Convenience methods for common operations
  created(item: string) {
    this.success(`${item} created successfully`);
  }

  updated(item: string) {
    this.success(`${item} updated successfully`);
  }

  deleted(item: string) {
    this.success(`${item} deleted successfully`);
  }

  uploadSuccess(filename: string) {
    this.success("File uploaded successfully", {
      description: filename,
    });
  }

  uploadError(error: string) {
    this.error("Upload failed", {
      description: error,
    });
  }

  exportSuccess() {
    this.success("Export completed successfully");
  }

  exportError() {
    this.error("Export failed");
  }

  backupSuccess() {
    this.success("Backup completed successfully");
  }

  backupError() {
    this.error("Backup failed");
  }

  genericError(message = "An error occurred") {
    this.error(message);
  }
}

export const toast = new Toast();
export { toast as default };
