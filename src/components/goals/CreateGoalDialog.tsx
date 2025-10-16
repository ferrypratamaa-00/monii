"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, User, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GoalUser {
  id: number;
  name: string;
  email: string;
}

export function CreateGoalDialog({ users }: { users: GoalUser[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [goalType, setGoalType] = useState<"personal" | "joint">("personal");
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const queryClient = useQueryClient();

  const createGoalMutation = useMutation({
    mutationFn: async (data: {
      type: string;
      name: string;
      targetAmount: number;
      deadline?: string;
      memberUserIds?: number[];
    }) => {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create goal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal created successfully!");
      resetForm();
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setGoalType("personal");
    setName("");
    setTargetAmount("");
    setDeadline("");
    setSelectedMembers([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(targetAmount);
    if (!name.trim()) {
      toast.error("Please enter a goal name");
      return;
    }
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid target amount");
      return;
    }
    if (goalType === "joint" && selectedMembers.length === 0) {
      toast.error("Please select at least one member for a joint goal");
      return;
    }

    const goalData = {
      type: goalType,
      name: name.trim(),
      targetAmount: amount,
      ...(deadline && { deadline: new Date(deadline).toISOString() }),
      ...(goalType === "joint" && { memberUserIds: selectedMembers }),
    };

    createGoalMutation.mutate(goalData);
  };

  const toggleMember = (userId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Buat Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Buat Goal Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Type */}
          <div>
            <Label>Tipe Goal</Label>
            <Select
              value={goalType}
              onValueChange={(value: "personal" | "joint") =>
                setGoalType(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Goal Pribadi
                  </div>
                </SelectItem>
                <SelectItem value="joint">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Goal Bersama
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Goal Name */}
          <div>
            <Label htmlFor="name">Nama Goal</Label>
            <Input
              id="name"
              placeholder="contoh: Tabungan Darurat, Liburan Bali"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
            />
          </div>

          {/* Target Amount */}
          <div>
            <Label htmlFor="amount">Target Jumlah (Rp)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
            />
          </div>

          {/* Deadline */}
          <div>
            <Label htmlFor="deadline">Deadline (Opsional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Members Selection (for joint goals) */}
          {goalType === "joint" && (
            <div>
              <Label>Anggota</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted w-full text-left ${
                      selectedMembers.includes(user.id) ? "bg-primary/10" : ""
                    }`}
                    onClick={() => toggleMember(user.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleMember(user.id);
                      }
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    {selectedMembers.includes(user.id) && (
                      <Badge variant="secondary">Dipilih</Badge>
                    )}
                  </button>
                ))}
              </div>
              {selectedMembers.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedMembers.length} anggota dipilih
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={createGoalMutation.isPending}
              className="flex-1"
            >
              {createGoalMutation.isPending ? "Membuat..." : "Buat Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
