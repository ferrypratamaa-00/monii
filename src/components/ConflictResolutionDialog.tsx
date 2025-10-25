"use client";

import { AlertTriangle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/lib/toast";
import { indexedDBService } from "../services/indexedDB";
import { syncService } from "../services/sync";

interface ConflictResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PendingOperation {
  id: string;
  type: "create_transaction" | "update_transaction" | "delete_transaction";
  data: Record<string, unknown>;
  timestamp: string;
  retryCount: number;
}

export default function ConflictResolutionDialog({
  open,
  onOpenChange,
}: ConflictResolutionDialogProps) {
  const [pendingOperations, setPendingOperations] = useState<
    PendingOperation[]
  >([]);
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [currentOperation, setCurrentOperation] = useState<string>("");

  const loadPendingOperations = useCallback(async () => {
    try {
      const operations = await indexedDBService.getPendingOperations();
      setPendingOperations(operations);
    } catch (error) {
      console.error("Failed to load pending operations:", error);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadPendingOperations();
    }
  }, [open, loadPendingOperations]);

  const handleResolveConflicts = async () => {
    if (!navigator.onLine) {
      toast.error("Offline", {
        description: "Please connect to the internet to resolve conflicts.",
      });
      return;
    }

    setIsResolving(true);
    setResolvedCount(0);

    try {
      for (const operation of pendingOperations) {
        setCurrentOperation(`${operation.type} - ${operation.id.slice(-8)}`);

        try {
          await syncService.processPendingOperation(operation);
          await indexedDBService.removePendingOperation(operation.id);
          setResolvedCount((prev) => prev + 1);
        } catch (error) {
          console.warn(`Failed to resolve operation ${operation.id}:`, error);

          // Increment retry count
          const newRetryCount = operation.retryCount + 1;
          await indexedDBService.updatePendingOperationRetryCount(
            operation.id,
            newRetryCount,
          );

          // If max retries exceeded, remove the operation
          if (newRetryCount >= 3) {
            await indexedDBService.removePendingOperation(operation.id);
            toast.error("Operation Failed", {
              description: `Removed failed operation after ${newRetryCount} attempts.`,
            });
          }
        }

        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      toast.success("Conflicts Resolved", {
        description: `Successfully resolved ${resolvedCount} out of ${pendingOperations.length} operations.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to resolve conflicts:", error);
      toast.error("Resolution Failed", {
        description:
          "Some conflicts could not be resolved. Please try again later.",
      });
    } finally {
      setIsResolving(false);
      setCurrentOperation("");
    }
  };

  const handleClearAll = async () => {
    try {
      for (const operation of pendingOperations) {
        await indexedDBService.removePendingOperation(operation.id);
      }

      setPendingOperations([]);
      toast.success("Cleared", {
        description: "All pending operations have been cleared.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to clear operations:", error);
      toast.error("Error", {
        description: "Failed to clear pending operations.",
      });
    }
  };

  const progress =
    pendingOperations.length > 0
      ? (resolvedCount / pendingOperations.length) * 100
      : 0;

  const getOperationDescription = (operation: PendingOperation) => {
    switch (operation.type) {
      case "create_transaction":
        return `Create transaction: Rp${(operation.data.amount as number)?.toLocaleString("id-ID") || "0"}`;
      case "update_transaction":
        return `Update transaction #${operation.data.id}`;
      case "delete_transaction":
        return `Delete transaction #${operation.data.id}`;
      default:
        return `${operation.type}`;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Sync Conflicts Detected
          </DialogTitle>
          <DialogDescription>
            You have {pendingOperations.length} pending operations that need to
            be synced. These were created while you were offline and may
            conflict with server data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Bar (when resolving) */}
          {isResolving && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Resolving conflicts...</span>
                <span>
                  {resolvedCount}/{pendingOperations.length}
                </span>
              </div>
              <Progress value={progress} className="w-full" />
              {currentOperation && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  {currentOperation}
                </p>
              )}
            </div>
          )}

          {/* Pending Operations List */}
          {!isResolving && pendingOperations.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <h4 className="text-sm font-medium">Pending Operations:</h4>
              <div className="space-y-2">
                {pendingOperations.map((operation) => (
                  <div
                    key={operation.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {getOperationDescription(operation)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(operation.timestamp)}
                        {operation.retryCount > 0 && (
                          <span className="text-orange-600">
                            (Retry {operation.retryCount}/3)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {operation.retryCount >= 3 ? (
                        <span className="text-xs text-red-600">Failed</span>
                      ) : (
                        <span className="text-xs text-green-600">Pending</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No pending operations */}
          {!isResolving && pendingOperations.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                All conflicts have been resolved!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isResolving}
              className="flex-1"
            >
              Cancel
            </Button>

            {pendingOperations.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  disabled={isResolving}
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleResolveConflicts}
                  disabled={isResolving || !navigator.onLine}
                  className="flex-1"
                >
                  {isResolving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Resolving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolve Now
                    </>
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Offline Notice */}
          {!navigator.onLine && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">You're offline</span>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                Please connect to the internet to resolve conflicts.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
