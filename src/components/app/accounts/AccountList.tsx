"use client";

import { useQuery } from "@tanstack/react-query";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteAccountAction } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AccountForm from "./AccountForm";

interface Account {
  id: number;
  name: string;
  initialBalance: string;
  balance: string;
}

export default function AccountList() {
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
    if (confirm("Are you sure you want to delete this account?")) {
      const result = await deleteAccountAction(accountId);
      if (result.success) {
        refetch();
      } else {
        console.error(result.error);
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading accounts...</div>;
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No accounts yet</p>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
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
        <h2 className="text-2xl font-bold">Accounts</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
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
                Initial: Rp{" "}
                {parseFloat(account.initialBalance).toLocaleString("id-ID")}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                Rp {parseFloat(account.balance).toLocaleString("id-ID")}
              </p>
              <p className="text-sm text-muted-foreground">Current Balance</p>
            </div>
            <div className="flex gap-2 ml-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingAccount(account)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Account</DialogTitle>
                  </DialogHeader>
                  <AccountForm
                    account={editingAccount || undefined}
                    onSuccess={() => {
                      setEditingAccount(null);
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
    </div>
  );
}
