"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Receipt } from "lucide-react";
import { useState } from "react";
import { ReceiptScanDialog } from "@/components/receipt/ReceiptScanDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionForm from "./TransactionForm";

export default function TransactionModal() {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch accounts and categories for the receipt scanner
  const { data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const response = await fetch("/api/accounts");
      if (!response.ok) throw new Error("Failed to fetch accounts");
      return response.json();
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Scan Receipt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-6">
            <TransactionForm onSuccess={() => setIsOpen(false)} />
          </TabsContent>

          <TabsContent value="scan" className="mt-6">
            <ReceiptScanDialog
              accounts={accounts || []}
              categories={categories || []}
              onTransactionCreate={() => {}} // Not used anymore, handled internally
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
