"use client";

import { useQuery } from "@tanstack/react-query";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteAccountAction } from "@/app/actions/account";
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
import AccountForm from "./AccountForm";

interface Account {
  id: number;
  name: string;
  initialBalance: string;
  balance: string;
}

export default function AccountList() {
  const { t } = useLanguage();
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { confirm, dialog } = useConfirmDialog();

  const {
    data: accounts,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const response = await fetch("/api/accounts");
      if (!response.ok) throw new Error("Failed to fetch accounts");
      return response.json();
    },
  });

  const handleDelete = async (accountId: number) => {
    confirm({
      title: t("accounts.deleteAccount"),
      description: t("accounts.deleteAccountConfirm"),
      variant: "destructive",
      onConfirm: async () => {
        const result = await deleteAccountAction(accountId);
        if (result.success) {
          toast.deleted(t("accounts.pageTitle"));
          refetch();
        } else {
          console.error(result.error);
          toast.error(t("accounts.deleteFailed"));
        }
      },
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">{t("accounts.loading")}</div>;
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">{t("accounts.noAccounts")}</p>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("accounts.createAccount")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("accounts.createNewAccount")}</DialogTitle>
            </DialogHeader>
            <AccountForm
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("accounts.pageTitle")}</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("accounts.addAccount")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("accounts.createNewAccount")}</DialogTitle>
            </DialogHeader>
            <AccountForm
              onSuccess={() => {
                setIsCreateOpen(false);
                refetch();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {accounts.map((account: Account) => (
          <div
            key={account.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex-1">
              <h3 className="font-medium">{account.name}</h3>
              <p className="text-sm text-muted-foreground">
                {t("accounts.initialBalance")}: Rp{" "}
                {parseFloat(account.initialBalance).toLocaleString("id-ID")}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                Rp {parseFloat(account.balance).toLocaleString("id-ID")}
              </p>
              <p className="text-sm text-muted-foreground">{t("accounts.currentBalance")}</p>
            </div>
            <div className="flex gap-2 ml-4">
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingAccount(account);
                      setIsEditOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("accounts.editAccount")}</DialogTitle>
                  </DialogHeader>
                  <AccountForm
                    account={editingAccount || undefined}
                    onSuccess={() => {
                      setEditingAccount(null);
                      setIsEditOpen(false);
                      refetch();
                    }}
                  />
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(account.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      {dialog}
    </div>
  );
}
