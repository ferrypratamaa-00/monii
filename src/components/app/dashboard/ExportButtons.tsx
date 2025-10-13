"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ExportButtons() {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (type: "transactions" | "budgets") => {
    setIsExporting(type);
    try {
      const response = await fetch(`/api/export?type=${type}`);
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => handleExport("transactions")}
        disabled={isExporting !== null}
      >
        <Download className="mr-2 h-4 w-4" />
        {isExporting === "transactions"
          ? "Exporting..."
          : "Export Transactions"}
      </Button>
      <Button
        variant="outline"
        onClick={() => handleExport("budgets")}
        disabled={isExporting !== null}
      >
        <Download className="mr-2 h-4 w-4" />
        {isExporting === "budgets" ? "Exporting..." : "Export Budgets"}
      </Button>
    </div>
  );
}
