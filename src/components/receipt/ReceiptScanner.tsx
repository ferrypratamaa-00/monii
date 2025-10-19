"use client";

import { Camera, Check, RotateCcw, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReceiptScannerProps {
  onImageCapture: (imageData: string) => void;
  onClose: () => void;
}

export function ReceiptScanner({
  onImageCapture,
  onClose,
}: ReceiptScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const startCamera = useCallback(async () => {
    console.log("ReceiptScanner: Starting camera initialization");
    // Check camera permission first
    if (navigator.permissions) {
      try {
        const permissionStatus = await navigator.permissions.query({
          name: "camera",
        });
        console.log("ReceiptScanner: Camera permission status:", permissionStatus.state);
        if (permissionStatus.state === "denied") {
          setPermissionDenied(true);
          return;
        }
      } catch (_error) {
        console.log("ReceiptScanner: Permissions API not supported, continuing with getUserMedia");
        // Permissions API not supported, continue with getUserMedia
      }
    }

    try {
      console.log("ReceiptScanner: Requesting camera access");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1080, max: 1080 },
          height: { ideal: 1920, max: 1920 },
          aspectRatio: 9/16,
        },
      });

      if (videoRef.current) {
        console.log("ReceiptScanner: Camera stream obtained, setting up video element");
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsStreaming(true);
      }
    } catch (error) {
      console.error("ReceiptScanner: Error accessing camera:", error);
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setPermissionDenied(true);
      } else {
        toast.error("Unable to access camera. Please check permissions.");
      }
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      setStream(null);
      setIsStreaming(false);
    }
  }, []);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const retakeImage = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const confirmImage = useCallback(() => {
    if (capturedImage) {
      onImageCapture(capturedImage);
      onClose();
    }
  }, [capturedImage, onImageCapture, onClose]);

  const requestPermission = useCallback(async () => {
    setPermissionDenied(false);
    await startCamera();
  }, [startCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  // Start camera when component mounts
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      {permissionDenied ? (
        <Card className="w-full max-w-sm mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="h-6 w-6" />
              Camera Permission Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-base text-muted-foreground mb-4">
                To scan receipts, we need access to your camera. Please grant
                camera permission to continue.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={requestPermission}
                className="flex-1 text-base py-3"
              >
                Grant Permission
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 text-base py-3"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-sm mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scan Receipt
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {!capturedImage ? (
              <>
                {/* Camera View */}
                <div className="relative w-full max-w-sm mx-auto bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-auto object-cover rounded-lg"
                    style={{ aspectRatio: '9/16' }}
                  />
                  {!isStreaming && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                      <div className="text-center text-white p-4">
                        <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Initializing camera...</p>
                        <p className="text-sm opacity-75 mt-2">Please allow camera access</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera Controls */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={captureImage}
                    disabled={!isStreaming}
                    size="lg"
                    className="px-8 py-3 text-base font-medium"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Take Photo
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleClose}
                    size="lg"
                    className="px-6 py-3 text-base"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Captured Image Preview */}
                <div className="relative w-full max-w-md mx-auto bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={capturedImage}
                    alt="Captured receipt"
                    width={225}
                    height={400}
                    className="w-full h-auto object-cover rounded-lg"
                  />
                </div>

                {/* Image Controls */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={retakeImage}
                    className="flex-1"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake
                  </Button>
                  <Button onClick={confirmImage} className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
                    Use This
                  </Button>
                </div>
              </>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Position the receipt within the frame and ensure good lighting for
              best results.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
