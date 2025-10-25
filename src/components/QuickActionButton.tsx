"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import TransactionModal from "./app/transactions/TransactionModal";

export function QuickActionButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Main FAB - Directly opens transaction modal */}
      <Button
        size="lg"
        className="fixed right-6 bottom-20 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 bg-primary hover:bg-primary/90"
        onClick={() => setIsModalOpen(true)}
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Add transaction</span>
      </Button>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
