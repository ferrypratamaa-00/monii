"use client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, File, FileText } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv");
  const [isExporting, setIsExporting] = useState(false);
  const { t } = useLanguage();

  // Fetch summary data based on date range
  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["reports-summary", dateRange.from, dateRange.to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange.from)
        params.append("startDate", dateRange.from.toISOString());
      if (dateRange.to) params.append("endDate", dateRange.to.toISOString());

      const response = await fetch(`/api/reports/summary?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch summary");
      return response.json();
    },
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.from)
        params.append("startDate", dateRange.from.toISOString());
      if (dateRange.to) params.append("endDate", dateRange.to.toISOString());

      const endpoint =
        exportFormat === "pdf"
          ? `/api/export/pdf?${params.toString()}`
          : `/api/export?type=transactions&${params.toString()}`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_${format(new Date(), "yyyy-MM-dd")}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(
        `Report exported successfully as ${exportFormat.toUpperCase()}`,
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" id="reports-heading">
            {t("reports.title")}
          </h1>
          <p className="text-muted-foreground">{t("reports.description")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("reports.exportTransactions")}</CardTitle>
          <CardDescription>{t("reports.exportDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date Range Selection */}
          <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <legend className="sr-only">Select date range for export</legend>
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground",
                    )}
                    aria-describedby="start-date-desc"
                  >
                    {dateRange.from
                      ? format(dateRange.from, "PPP")
                      : "Pick start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date: Date | undefined) =>
                      setDateRange((prev) => ({ ...prev, from: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div id="start-date-desc" className="sr-only">
                Select the start date for the transaction export period
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.to && "text-muted-foreground",
                    )}
                    aria-describedby="end-date-desc"
                  >
                    {dateRange.to
                      ? format(dateRange.to, "PPP")
                      : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date: Date | undefined) =>
                      setDateRange((prev) => ({ ...prev, to: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div id="end-date-desc" className="sr-only">
                Select the end date for the transaction export period
              </div>
            </div>
          </fieldset>

          {/* Export Format Selection */}
          <div className="space-y-2">
            <Label htmlFor="export-format">Export Format</Label>
            <Select
              value={exportFormat}
              onValueChange={(value: "csv" | "pdf") => setExportFormat(value)}
            >
              <SelectTrigger
                id="export-format"
                className="w-full md:w-48"
                aria-describedby="format-desc"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" aria-hidden="true" />
                    CSV File
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    PDF Report
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <div id="format-desc" className="sr-only">
              Choose the file format for your transaction export
            </div>
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full md:w-auto"
            aria-describedby="export-desc"
          >
            <Download className="h-4 w-4 mr-2" aria-hidden="true" />
            {isExporting
              ? "Exporting..."
              : `Export as ${exportFormat.toUpperCase()}`}
          </Button>
          <div id="export-desc" className="sr-only">
            Download your transaction data in the selected format and date range
          </div>
        </CardContent>
      </Card>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("reports.totalTransactions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingSummary ? "..." : summaryData?.totalTransactions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("reports.inSelectedPeriod")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("reports.totalIncome")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-income">
              Rp{" "}
              {isLoadingSummary
                ? "..."
                : (summaryData?.income || 0).toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("reports.inSelectedPeriod")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("reports.totalExpenses")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-expense">
              Rp{" "}
              {isLoadingSummary
                ? "..."
                : (summaryData?.expense || 0).toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("reports.inSelectedPeriod")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
