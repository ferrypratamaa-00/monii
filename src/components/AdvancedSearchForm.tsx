"use client";
import { format } from "date-fns";
import { Filter, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import type { SearchFiltersSchema } from "@/lib/validations/search";

type SearchFilters = z.infer<typeof SearchFiltersSchema>;

interface AdvancedSearchFormProps {
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  categories: Array<{ id: number; name: string; type: "INCOME" | "EXPENSE" }>;
  accounts: Array<{ id: number; name: string }>;
}

export default function AdvancedSearchForm({
  onFiltersChange,
  categories,
  accounts,
}: AdvancedSearchFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Partial<SearchFilters>>({
    query: "",
    categoryId: undefined,
    accountId: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    amountMin: undefined,
    amountMax: undefined,
    type: undefined,
  });

  const lastSentFiltersRef = useRef<Partial<SearchFilters> | null>(null);

  // Clear invalid filters when data changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    const newFilters = { ...filters };
    let hasChanges = false;

    if (
      filters.categoryId &&
      !categories.find((c) => c.id === filters.categoryId)
    ) {
      newFilters.categoryId = undefined;
      hasChanges = true;
    }

    if (
      filters.accountId &&
      !accounts.find((a) => a.id === filters.accountId)
    ) {
      newFilters.accountId = undefined;
      hasChanges = true;
    }

    if (hasChanges) {
      setFilters(newFilters);
    }
  }, [categories, accounts]);

  // Debounce search query updates only
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ query: filters.query });
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.query, onFiltersChange]);

  const applyFilters = () => {
    onFiltersChange(filters);
    lastSentFiltersRef.current = filters;
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    const cleared = {
      query: "",
      categoryId: undefined,
      accountId: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      amountMin: undefined,
      amountMax: undefined,
      type: undefined,
    };
    setFilters(cleared);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== "" && value !== null,
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari berdasarkan deskripsi transaksi..."
            value={filters.query || ""}
            onChange={(e) => updateFilters({ query: e.target.value })}
            className="pl-10"
          />
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Hapus Filter
          </Button>
        )}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(hasActiveFilters && "border-primary")}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {hasActiveFilters && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs px-1 rounded">
                  {
                    Object.values(filters).filter(
                      (value) =>
                        value !== undefined && value !== "" && value !== null,
                    ).length
                  }
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filter Pencarian</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Hapus Semua
                  </Button>
                )}
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="type">Tipe Transaksi</Label>
                <Select
                  value={filters.type || "all"}
                  onValueChange={(value) =>
                    updateFilters({
                      type: value === "all" ? undefined : (value as "INCOME" | "EXPENSE"),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua tipe</SelectItem>
                    <SelectItem value="INCOME">Pemasukan</SelectItem>
                    <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={filters.categoryId?.toString() || "all"}
                  onValueChange={(value) =>
                    updateFilters({
                      categoryId: value === "all" ? undefined : value ? parseInt(value, 10) : undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua kategori</SelectItem>
                    {categories.map((category) => (
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

              {/* Account Filter */}
              <div className="space-y-2">
                <Label htmlFor="account">Akun</Label>
                <Select
                  value={filters.accountId?.toString() || "all"}
                  onValueChange={(value) =>
                    updateFilters({
                      accountId: value === "all" ? undefined : value ? parseInt(value, 10) : undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua akun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua akun</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem
                        key={account.id}
                        value={account.id.toString()}
                      >
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label>Rentang Tanggal</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="dateFrom" className="text-xs">
                      Dari
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filters.dateFrom && "text-muted-foreground",
                          )}
                        >
                          {filters.dateFrom
                            ? format(filters.dateFrom, "dd/MM/yyyy")
                            : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateFrom}
                          onSelect={(date: Date | undefined) =>
                            updateFilters({ dateFrom: date })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="dateTo" className="text-xs">
                      Sampai
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filters.dateTo && "text-muted-foreground",
                          )}
                        >
                          {filters.dateTo
                            ? format(filters.dateTo, "dd/MM/yyyy")
                            : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateTo}
                          onSelect={(date: Date | undefined) =>
                            updateFilters({ dateTo: date })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Amount Range */}
              <div className="space-y-2">
                <Label>Rentang Jumlah (Rp)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="amountMin" className="text-xs">
                      Minimum
                    </Label>
                    <Input
                      id="amountMin"
                      type="number"
                      placeholder="0"
                      value={filters.amountMin || ""}
                      onChange={(e) =>
                        updateFilters({
                          amountMin: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="amountMax" className="text-xs">
                      Maksimum
                    </Label>
                    <Input
                      id="amountMax"
                      type="number"
                      placeholder="Tidak terbatas"
                      value={filters.amountMax || ""}
                      onChange={(e) =>
                        updateFilters({
                          amountMax: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={applyFilters} className="w-full">
                  Terapkan Filter
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
