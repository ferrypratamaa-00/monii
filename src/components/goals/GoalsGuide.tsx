"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  Trophy,
  Lightbulb,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GoalsGuideProps {
  onCreateGoal?: () => void;
}

export function GoalsGuide({ onCreateGoal }: GoalsGuideProps) {
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    {
      icon: Target,
      title: "1. Tetapkan Target",
      description: "Buat goal dengan nama, jumlah target, dan deadline opsional",
      details: "Misal: 'Tabungan Liburan Bali - Rp 5.000.000' dengan deadline 6 bulan",
    },
    {
      icon: DollarSign,
      title: "2. Kontribusi Rutin",
      description: "Transfer uang dari rekening kamu ke goal secara berkala",
      details: "Setiap bulan/gajian, alokasikan sebagian untuk goal ini",
    },
    {
      icon: TrendingUp,
      title: "3. Pantau Progress",
      description: "Lihat progress bar dan persentase pencapaian goal",
      details: "Sistem akan tracking otomatis berapa yang sudah terkumpul",
    },
    {
      icon: Trophy,
      title: "4. Raih Achievement",
      description: "Dapatkan badge dan reward saat goal tercapai",
      details: "Unlock achievement seperti 'First Goal', 'Millionaire', dll",
    },
  ];

  const tips = [
    {
      icon: Calendar,
      title: "Deadline Realistis",
      tip: "Set deadline yang masuk akal. Goal jangka panjang (1-2 tahun) lebih sustainable",
    },
    {
      icon: TrendingUp,
      title: "Kontribusi Rutin",
      tip: "Lebih baik sedikit tapi rutin, daripada banyak tapi jarang. Konsistensi adalah kunci",
    },
    {
      icon: Lightbulb,
      title: "Break Down Goal",
      tip: "Bagi goal besar jadi milestone kecil. Misal: Rp 5jt = 10 milestone Rp 500rb",
    },
    {
      icon: CheckCircle,
      title: "Track & Celebrate",
      tip: "Rayakan setiap milestone! Ini akan memotivasi kamu untuk lanjut",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Lightbulb className="h-4 w-4 mr-2" />
          Panduan Goals
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Cara Kerja Goals & Cara Mencapainya
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Flow Steps */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Flow Goals Lengkap
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {steps.map((step, index) => (
                <Card key={index} className="relative">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <step.icon className="h-5 w-5 text-primary" />
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.details}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Tips Sukses Capai Goals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tips.map((tip, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <tip.icon className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm mb-1">
                          {tip.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {tip.tip}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Example */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contoh Praktis</h3>
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Goal</Badge>
                    <span className="font-medium">Tabungan Motor Baru</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Target: Rp 15.000.000</p>
                    <p>• Deadline: 12 bulan (1 tahun)</p>
                    <p>• Kontribusi bulanan: Rp 1.250.000 (dari gaji)</p>
                    <p>• Progress tracking: Lihat setiap bulan berapa yang sudah terkumpul</p>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">
                      <strong>Flow:</strong> Setiap tanggal 25 (gajian) → Transfer Rp 1.250.000 ke goal →
                      Sistem otomatis update progress → Dapat badge milestone setiap Rp 3jt
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => {
                setIsOpen(false);
                onCreateGoal?.();
              }}
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Mulai Buat Goal Pertama Kamu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}