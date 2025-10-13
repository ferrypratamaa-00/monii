"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getAccounts } from "@/services/account";
import { AccountForm } from "./AccountForm";

export function AccountList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts(1), // TODO: get userId
  });

  const handleAdd = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Akun Dompet</h2>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>Tambah Akun</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? "Edit Akun" : "Tambah Akun"}
              </DialogTitle>
            </DialogHeader>
            <AccountForm
              accountId={editingAccount?.id}
              defaultValues={
                editingAccount
                  ? {
                      name: editingAccount.name,
                      initialBalance: parseFloat(editingAccount.initialBalance),
                    }
                  : undefined
              }
              onSuccess={handleModalClose}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4">
        {accounts?.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <CardTitle className="flex justify-between">
                {account.name}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(account)}
                >
                  Edit
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Saldo Awal: Rp {account.initialBalance}</p>
              <p>Saldo Saat Ini: Rp {account.balance}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
