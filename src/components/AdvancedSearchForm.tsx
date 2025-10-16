"use client";
import { format } from "date-fns";
import { Filter, Search, X } from "lucide-react";
import { useState } from "react";
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

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
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
    onFiltersChange(cleared);
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
            placeholder="Search transactions..."
            value={filters.query || ""}
            onChange={(e) => updateFilters({ query: e.target.value })}
            className="pl-10"
          />
        </div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(hasActiveFilters && "border-primary")}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs px-1 rounded">
                  {Object.values(filters).filter(Boolean).length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Advanced Filters</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="type">Transaction Type</Label>
                <Select
                  value={filters.type || ""}
                  onValueChange={(value) =>
                    updateFilters({
                      type: value as "INCOME" | "EXPENSE" | undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={filters.categoryId?.toString() || ""}
                  onValueChange={(value) =>
                    updateFilters({
                      categoryId: value ? parseInt(value, 10) : undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
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
                <Label htmlFor="account">Account</Label>
                <Select
                  value={filters.accountId?.toString() || ""}
                  onValueChange={(value) =>
                    updateFilters({
                      accountId: value ? parseInt(value, 10) : undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All accounts</SelectItem>
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
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="dateFrom" className="text-xs">
                      From
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
                            ? format(filters.dateFrom, "MMM dd, yyyy")
                            : "Pick date"}
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
                      To
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
                            ? format(filters.dateTo, "MMM dd, yyyy")
                            : "Pick date"}
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
                <Label>Amount Range (Rp)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="amountMin" className="text-xs">
                      Min
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
                      Max
                    </Label>
                    <Input
                      id="amountMax"
                      type="number"
                      placeholder="No limit"
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
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
