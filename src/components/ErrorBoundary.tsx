"use client";

import { AlertTriangle } from "lucide-react";
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Oops! Terjadi Kesalahan
            </h2>
            <p className="text-muted-foreground mb-6">
              Maaf, terjadi kesalahan yang tidak terduga. Silakan muat ulang
              halaman atau hubungi dukungan jika masalah berlanjut.
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-colors"
              >
                Muat Ulang Halaman
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/dashboard";
                }}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold py-3 rounded-xl transition-colors"
              >
                Kembali ke Dashboard
              </button>
            </div>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                  Detail Error
                </summary>
                <pre className="mt-2 text-xs bg-muted p-3 rounded-lg overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
