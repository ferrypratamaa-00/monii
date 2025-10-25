"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteDebtAction, markAsPaidAction } from "@/app/actions/debt";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/lib/toast";
import { useLanguage } from "@/components/LanguageProvider";
import DebtForm from "./DebtForm";

interface Debt {
  id: number;
  type: "DEBT" | "RECEIVABLE";
  personName: string;
  amount: string;
  dueDate?: Date;
  status: "ACTIVE" | "PAID";
}

export default function DebtList() {
  const { t } = useLanguage();
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { confirm, dialog } = useConfirmDialog();

  const {
    data: debts,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["debts"],
    queryFn: async () => {
      const response = await fetch("/api/debts");
      if (!response.ok) throw new Error("Failed to fetch debts");
      return response.json();
    },
  });

  const handleDelete = async (debtId: number) => {
    confirm({
      title: t("debts.deleteDebt"),
      description: t("debts.deleteDebtConfirm"),
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
      variant: "destructive",
      onConfirm: async () => {
        const result = await deleteDebtAction(debtId);
        if (result.success) {
          toast.deleted(t("debts.pageTitle"));
          refetch();
        } else {
          console.error(result.error);
          toast.error(t("debts.deleteFailed"));
        }
      },
    });
  };

  const handleMarkAsPaid = async (debtId: number) => {
    const result = await markAsPaidAction(debtId);
    if (result.success) {
      refetch();
    } else {
      console.error(result.error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">{t("debts.loading")}</div>;
  }

  if (!debts || debts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">{t("debts.noDebts")}</p>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("debts.addDebt")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("debts.addNewDebt")}</DialogTitle>
            </DialogHeader>
            <DebtForm
              onSuccess={() => {
                setIsCreateOpen(false);
                refetch();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const activeDebts = debts.filter((debt: Debt) => debt.status === "ACTIVE");
  const paidDebts = debts.filter((debt: Debt) => debt.status === "PAID");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("debts.pageTitle")}</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("debts.addNew")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("debts.addNewDebt")}</DialogTitle>
            </DialogHeader>
            <DebtForm
              onSuccess={() => {
                setIsCreateOpen(false);
                refetch();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {activeDebts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-orange-600 mb-2">
              {t("debts.active")}
            </h3>
            <div className="space-y-2">
              {activeDebts.map((debt: Debt) => (
                <div
                  key={debt.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          debt.type === "DEBT"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {debt.type === "DEBT" ? t("debts.iOwe") : t("debts.owedToMe")}
                      </span>
                      <span className="font-medium">{debt.personName}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("debts.amount")}: Rp{" "}
                      {parseFloat(debt.amount).toLocaleString("id-ID")}
                      {debt.dueDate && (
                        <>
                          {" "}
                          • {t("debts.due")}: {new Date(debt.dueDate).toLocaleDateString()}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsPaid(debt.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingDebt(debt)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t("debts.editDebt")}</DialogTitle>
                        </DialogHeader>
                        <DebtForm
                          debt={editingDebt || undefined}
                          onSuccess={() => {
                            setEditingDebt(null);
                            refetch();
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(debt.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {paidDebts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-2">{t("debts.paid")}</h3>
            <div className="space-y-2">
              {paidDebts.map((debt: Debt) => (
                <div
                  key={debt.id}
                  className="flex items-center justify-between p-4 border rounded-lg opacity-75"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                        {t("debts.paidStatus")}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          debt.type === "DEBT"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {debt.type === "DEBT" ? t("debts.iOwed") : t("debts.owedToMe")}
                      </span>
                      <span className="font-medium">{debt.personName}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("debts.amount")}: Rp{" "}
                      {parseFloat(debt.amount).toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(debt.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {dialog}
    </div>
  );
}
