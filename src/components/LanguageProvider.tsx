"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type Language = "id" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  id: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.transactions": "Transaksi",
    "nav.accounts": "Akun",
    "nav.categories": "Kategori",
    "nav.reports": "Laporan",
    "nav.debts": "Utang",
    "nav.goals": "Target",
    "nav.more": "Lainnya",

    // Dashboard
    "dashboard.greeting": "Hai",
    "dashboard.balanceLabel": "saldo kamu hari ini...",
    "dashboard.addNote": "Tambah Catatan",
    "dashboard.viewReport": "Lihat Laporan",
    "dashboard.income": "Pemasukan",
    "dashboard.expense": "Pengeluaran",
    "dashboard.recentTransactions": "Transaksi Terbaru",
    "dashboard.viewAll": "Lihat Semua",
    "dashboard.noTransactions": "Belum ada transaksi",
    "dashboard.financialRecords": "Catatan Keuangan",
    "dashboard.expenseChart": "Pengeluaran",
    "dashboard.exportData": "Export Data",
    "dashboard.expenseByCategory": "Pengeluaran per Kategori",

    // Common
    "common.save": "Simpan",
    "common.cancel": "Batal",
    "common.delete": "Hapus",
    "common.edit": "Edit",
    "common.add": "Tambah",
    "common.search": "Cari",
    "common.filter": "Filter",
    "common.date": "Tanggal",
    "common.amount": "Jumlah",
    "common.category": "Kategori",
    "common.description": "Deskripsi",
    "common.loading": "Memuat...",
    "common.error": "Terjadi kesalahan",
    "common.success": "Berhasil",

    // AI Suggestions
    "ai.title": "AI Financial Insights",
    "ai.description": "Analyzing your financial patterns...",
    "ai.error": "Unable to load AI insights at this time.",
    "ai.recommendations": "AI Recommendations",
    "ai.recommendationsDesc":
      "Personalized insights to improve your financial health",
    "ai.noRecommendations":
      "No specific recommendations at this time. Keep up the good work!",
    "ai.healthScore": "Financial Health Score",
    "ai.healthScoreDesc":
      "Your overall financial wellness based on spending patterns and habits",
    "ai.grade": "Grade",
    "ai.strengths": "Strengths",
    "ai.improvements": "Areas for Improvement",
    "ai.spendingPredictions": "Spending Predictions",
    "ai.spendingPredictionsDesc":
      "AI-powered predictions for next month's spending by category",
    "ai.confidence": "confidence",
    "ai.riskAssessment": "Risk Assessment",
    "ai.riskAssessmentDesc":
      "Current financial risk level and mitigation strategies",
    "ai.riskLevel": "Risk Level",
    "ai.riskFactors": "Risk Factors",
    "ai.recommendationsTitle": "Recommendations",
    "ai.impact": "Impact",

    // Export
    "export.transactions": "Export Transactions",
    "export.budgets": "Export Budgets",
    "export.backup": "Backup Data",
    "export.exporting": "Exporting...",
    "export.backingUp": "Backing up...",
    "export.failed": "Failed to export data",
    "export.backupFailed": "Failed to backup data",

    // Reports
    "reports.title": "Laporan",
    "reports.description": "Export data transaksi Anda dalam berbagai format",
    "reports.exportTransactions": "Export Transaksi",
    "reports.exportDescription": "Download riwayat transaksi Anda sebagai file CSV atau PDF",
    "reports.totalTransactions": "Total Transaksi",
    "reports.totalIncome": "Total Pemasukan",
    "reports.totalExpenses": "Total Pengeluaran",
    "reports.inSelectedPeriod": "Dalam periode yang dipilih",
  },
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.transactions": "Transactions",
    "nav.accounts": "Accounts",
    "nav.categories": "Categories",
    "nav.reports": "Reports",
    "nav.debts": "Debts",
    "nav.goals": "Goals",
    "nav.more": "More",

    // Dashboard
    "dashboard.greeting": "Hi",
    "dashboard.balanceLabel": "your balance today...",
    "dashboard.addNote": "Add Note",
    "dashboard.viewReport": "View Report",
    "dashboard.income": "Income",
    "dashboard.expense": "Expense",
    "dashboard.recentTransactions": "Recent Transactions",
    "dashboard.viewAll": "View All",
    "dashboard.noTransactions": "No transactions yet",
    "dashboard.financialRecords": "Financial Records",
    "dashboard.expenseChart": "Expenses",
    "dashboard.exportData": "Export Data",
    "dashboard.expenseByCategory": "Expense by Category",

    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.date": "Date",
    "common.amount": "Amount",
    "common.category": "Category",
    "common.description": "Description",
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.success": "Success",

    // AI Suggestions
    "ai.title": "AI Financial Insights",
    "ai.description": "Analyzing your financial patterns...",
    "ai.error": "Unable to load AI insights at this time.",
    "ai.recommendations": "AI Recommendations",
    "ai.recommendationsDesc":
      "Personalized insights to improve your financial health",
    "ai.noRecommendations":
      "No specific recommendations at this time. Keep up the good work!",
    "ai.healthScore": "Financial Health Score",
    "ai.healthScoreDesc":
      "Your overall financial wellness based on spending patterns and habits",
    "ai.grade": "Grade",
    "ai.strengths": "Strengths",
    "ai.improvements": "Areas for Improvement",
    "ai.spendingPredictions": "Spending Predictions",
    "ai.spendingPredictionsDesc":
      "AI-powered predictions for next month's spending by category",
    "ai.confidence": "confidence",
    "ai.riskAssessment": "Risk Assessment",
    "ai.riskAssessmentDesc":
      "Current financial risk level and mitigation strategies",
    "ai.riskLevel": "Risk Level",
    "ai.riskFactors": "Risk Factors",
    "ai.recommendationsTitle": "Recommendations",
    "ai.impact": "Impact",

    // Export
    "export.transactions": "Export Transactions",
    "export.budgets": "Export Budgets",
    "export.backup": "Backup Data",
    "export.exporting": "Exporting...",
    "export.backingUp": "Backing up...",
    "export.failed": "Failed to export data",
    "export.backupFailed": "Failed to backup data",

    // Reports
    "reports.title": "Reports",
    "reports.description": "Export your transaction data in various formats",
    "reports.exportTransactions": "Export Transactions",
    "reports.exportDescription": "Download your transaction history as CSV or PDF file",
    "reports.totalTransactions": "Total Transactions",
    "reports.totalIncome": "Total Income",
    "reports.totalExpenses": "Total Expenses",
    "reports.inSelectedPeriod": "In selected period",
  },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("id");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = (localStorage.getItem("language") as Language) || "id";
    setLanguageState(savedLang);
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.id] || key;
  };

  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
