"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Camera,
  CheckCircle,
  Loader2,
  Receipt,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { createTransactionAction } from "@/app/actions/transaction";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { OCRService, type ParsedReceipt } from "@/services/ocr";
import { ReceiptScanner } from "./ReceiptScanner";

interface ReceiptScanDialogProps {
  accounts: Array<{ id: number; name: string; balance: number }>;
  categories: Array<{ id: number; name: string; type: "INCOME" | "EXPENSE" }>;
}

export function ReceiptScanDialog({
  accounts,
  categories,
}: ReceiptScanDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedReceipt | null>(null);
  const [cameraPermission, setCameraPermission] = useState<
    "granted" | "denied" | "prompt" | "unknown"
  >("unknown");
  const [manualData, setManualData] = useState({
    amount: "",
    description: "",
    accountId: "",
    categoryId: "",
    date: new Date().toISOString().split("T")[0],
  });

  const queryClient = useQueryClient();

  const createTransactionMutation = useMutation({
    mutationFn: async (transaction: {
      accountId: number;
      categoryId: number;
      amount: number;
      description: string;
      date: string;
      type: "INCOME" | "EXPENSE";
    }) => {
      const formData = new FormData();
      formData.append("accountId", transaction.accountId.toString());
      formData.append("categoryId", transaction.categoryId.toString());
      formData.append("type", transaction.type);
      formData.append("amount", transaction.amount.toString());
      formData.append("description", transaction.description);
      formData.append("date", new Date(transaction.date).toISOString());
      formData.append("isRecurring", "false");

      return createTransactionAction(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Transaction created successfully!");
      setIsOpen(false);
      // Reset form
      setCapturedImage(null);
      setParsedData(null);
      setManualData({
        amount: "",
        description: "",
        accountId: "",
        categoryId: "",
        date: new Date().toISOString().split("T")[0],
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create transaction: ${error.message}`);
    },
  });

  const ocrMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const ocrResponse = await OCRService.extractText(imageData);
      if (!ocrResponse.success || !ocrResponse.data) {
        throw new Error(ocrResponse.error || "OCR failed");
      }
      return OCRService.parseReceiptData(ocrResponse.data);
    },
    onSuccess: (data) => {
      setParsedData(data);
      // Auto-fill form with parsed data
      setManualData((prev) => ({
        ...prev,
        amount: data.amount?.toString() || "",
        description: data.vendor || "",
        date: data.date || prev.date,
      }));
      toast.success("Receipt scanned successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to scan receipt: ${error.message}`);
    },
  });

  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setShowScanner(false);
    // Automatically start OCR processing
    ocrMutation.mutate(imageData);
  };

  const handleManualEntry = () => {
    setShowScanner(false);
    setCapturedImage(null);
    setParsedData(null);
  };

  const handleSubmit = () => {
    const amount = parseFloat(manualData.amount);
    const accountId = parseInt(manualData.accountId, 10);
    const categoryId = parseInt(manualData.categoryId, 10);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!accountId || !categoryId) {
      toast.error("Please select an account and category");
      return;
    }

    const selectedAccount = accounts.find((a) => a.id === accountId);
    if (!selectedAccount || selectedAccount.balance < amount) {
      toast.error("Insufficient balance in selected account");
      return;
    }

    createTransactionMutation.mutate({
      accountId,
      categoryId,
      amount,
      description: manualData.description || "Receipt scan",
      date: manualData.date,
      type: "EXPENSE", // Receipts are typically expenses
    });
  };

  const checkCameraPermission = async () => {
    if (navigator.permissions) {
      try {
        const permissionStatus = await navigator.permissions.query({
          name: "camera",
        });
        setCameraPermission(permissionStatus.state);
      } catch (error: unknown) {
        const err = error as Error;
        if (err.message?.includes("Permissions policy")) {
          setCameraPermission("denied");
        } else {
          setCameraPermission("unknown");
        }
      }
    } else {
      setCameraPermission("unknown");
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // biome-ignore lint/suspicious/useIterableCallbackReturn: <>
      stream.getTracks().forEach((track) => track.stop());
      setCameraPermission("granted");
      toast.success("Camera permission granted!");
    } catch (error: unknown) {
      const err = error as Error;
      if (err.name === "NotAllowedError") {
        setCameraPermission("denied");
        toast.error(
          "Camera permission denied. Please enable camera access in your browser settings.",
        );
      } else if (err.name === "NotFoundError") {
        setCameraPermission("denied");
        toast.error("No camera found on this device.");
      } else if (err.message?.includes("Permissions policy")) {
        setCameraPermission("denied");
        toast.error(
          "Camera access is blocked by your browser's security policy. Please check your site settings or try a different browser.",
        );
      } else {
        setCameraPermission("denied");
        toast.error(
          "Unable to access camera. Please check your device settings.",
        );
      }
    }
  };

  const resetScan = () => {
    setCapturedImage(null);
    setParsedData(null);
    setShowScanner(true);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) {
          checkCameraPermission();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Receipt className="h-4 w-4" />
          Scan Receipt
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Scan Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scan Options */}
          {!capturedImage && !showScanner && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cameraPermission === "denied" ? (
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={requestCameraPermission}
                >
                  <CardContent className="p-6 text-center">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-orange-500" />
                    <h3 className="font-semibold mb-2">Enable Camera</h3>
                    <p className="text-sm text-muted-foreground">
                      Camera access is required to scan receipts. Click to grant
                      permission or check your browser settings.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setShowScanner(true)}
                >
                  <CardContent className="p-6 text-center">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                    <h3 className="font-semibold mb-2">Scan Receipt</h3>
                    <p className="text-sm text-muted-foreground">
                      Use your camera to scan a receipt and automatically
                      extract transaction details.
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={handleManualEntry}
              >
                <CardContent className="p-6 text-center">
                  <Receipt className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="font-semibold mb-2">Manual Entry</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter transaction details manually without scanning.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Receipt Scanner */}
          {showScanner && (
            <ReceiptScanner
              onImageCapture={handleImageCapture}
              onClose={() => setShowScanner(false)}
            />
          )}

          {/* OCR Processing Status */}
          {capturedImage && ocrMutation.isPending && (
            <Card>
              <CardContent className="p-6 text-center">
                <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-500" />
                <h3 className="font-semibold mb-2">Processing Receipt</h3>
                <p className="text-sm text-muted-foreground">
                  Extracting text and analyzing receipt data...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Captured Image and Parsed Data */}
          {capturedImage && !ocrMutation.isPending && (
            <div className="space-y-4">
              {/* Image Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Captured Receipt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <Image
                      src={capturedImage}
                      alt="Captured receipt"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button variant="outline" onClick={resetScan} size="sm">
                    Scan Again
                  </Button>
                </CardContent>
              </Card>

              {/* Parsed Data Summary */}
              {parsedData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Extracted Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {parsedData.vendor && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Vendor:</span>
                        <Badge variant="secondary">{parsedData.vendor}</Badge>
                      </div>
                    )}
                    {parsedData.amount && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Amount:</span>
                        <Badge variant="secondary">
                          ${parsedData.amount.toFixed(2)}
                        </Badge>
                      </div>
                    )}
                    {parsedData.date && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Date:</span>
                        <Badge variant="secondary">{parsedData.date}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Error State */}
              {ocrMutation.isError && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
                    <h3 className="font-semibold mb-2">Scan Failed</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      We couldn't extract information from this receipt. Please
                      enter details manually.
                    </p>
                    <Button onClick={handleManualEntry} variant="outline">
                      Enter Manually
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Transaction Form */}
          {(parsedData || (!capturedImage && !showScanner)) && (
            <>
              <Separator />
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transaction Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={manualData.amount}
                        onChange={(e) =>
                          setManualData((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={manualData.date}
                        onChange={(e) =>
                          setManualData((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="What was this purchase for?"
                      value={manualData.description}
                      onChange={(e) =>
                        setManualData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="account">Account *</Label>
                      <Select
                        value={manualData.accountId}
                        onValueChange={(value) =>
                          setManualData((prev) => ({
                            ...prev,
                            accountId: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem
                              key={account.id}
                              value={account.id.toString()}
                            >
                              {account.name} ($
                              {account.balance.toLocaleString()})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={manualData.categoryId}
                        onValueChange={(value) =>
                          setManualData((prev) => ({
                            ...prev,
                            categoryId: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .filter((cat) => cat.type === "EXPENSE")
                            .map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id.toString()}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSubmit} className="flex-1">
                      Create Transaction
                    </Button>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
