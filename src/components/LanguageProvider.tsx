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
    "nav.budget": "Anggaran",
    "nav.reports": "Laporan",
    "nav.debts": "Utang",
    "nav.goals": "Target",
    "nav.settings": "Pengaturan",
    "nav.more": "Lainnya",
    "nav.logout": "Logout",

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
    "dashboard.online": "Online",
    "dashboard.offline": "Offline",
    "dashboard.pending": "menunggu",
    "dashboard.syncConflict": "Konflik sinkronisasi",
    "dashboard.other": "Lainnya",

    // Offline Dashboard
    "offline.mode": "Mode Offline",
    "offline.showingCachedData": "Menampilkan data terakhir yang tersimpan",
    "offline.lastBalance": "Saldo terakhir",
    "offline.cachedAccounts": "Akun Tersimpan",
    "offline.lastUpdate": "Update terakhir:",
    "offline.cachedCategories": "Kategori Tersimpan",
    "offline.offlineMode": "Mode Offline",
    "offline.offlineDescription": "Anda sedang melihat data yang tersimpan di perangkat ini. Beberapa fitur seperti menambah transaksi atau melihat laporan terbaru memerlukan koneksi internet.",
    "offline.autoUpdate": "Data akan diperbarui secara otomatis saat kembali online.",

    // Charts
    "charts.incomeVsExpense": "Tren Pemasukan vs Pengeluaran",
    "charts.last12Months": "12 bulan terakhir",
    "charts.amount": "Jumlah",

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
    "reports.exportDescription":
      "Download riwayat transaksi Anda sebagai file CSV atau PDF",
    "reports.totalTransactions": "Total Transaksi",
    "reports.totalIncome": "Total Pemasukan",
    "reports.totalExpenses": "Total Pengeluaran",
    "reports.inSelectedPeriod": "Dalam periode yang dipilih",
    "reports.startDate": "Tanggal Mulai",
    "reports.pickStartDate": "Pilih tanggal mulai",
    "reports.endDate": "Tanggal Akhir",
    "reports.pickEndDate": "Pilih tanggal akhir",
    "reports.exportFormat": "Format Export",
    "reports.csvFile": "File CSV",
    "reports.pdfReport": "Laporan PDF",
    "reports.exporting": "Mengekspor...",
    "reports.exportAs": "Export sebagai",

    // Offline
    "offline.message": "Koneksi Terputus",
    "offline.description": "Beberapa fitur terbatas saat offline",

    // Onboarding
    "onboarding.welcome": "Selamat Datang di Monii",
    "onboarding.welcomeDesc":
      "Aplikasi manajemen keuangan pribadi yang simpel dan cerdas untuk membantu Anda mengatur keuangan dengan mudah.",
    "onboarding.transactions": "Catat Transaksi dengan Mudah",
    "onboarding.transactionsDesc":
      "Tambahkan pemasukan dan pengeluaran Anda setiap hari. Gunakan kamera untuk scan receipt otomatis.",
    "onboarding.accounts": "Kelola Akun & Kategori",
    "onboarding.accountsDesc":
      "Atur rekening bank, dompet, dan kategori pengeluaran untuk memudahkan tracking keuangan Anda.",
    "onboarding.reports": "Pantau Progress Finansial",
    "onboarding.reportsDesc":
      "Lihat laporan keuangan, grafik pengeluaran, dan wawasan AI untuk pengelolaan keuangan yang lebih baik.",
    "onboarding.offline": "Offline Support",
    "onboarding.offlineDesc":
      "Akses data keuangan Anda bahkan tanpa koneksi internet. Data tersimpan dan tersinkronisasi otomatis.",
    "onboarding.skip": "Lewati",
    "onboarding.next": "Selanjutnya",
    "onboarding.back": "Kembali",
    "onboarding.start": "Mulai",
    "onboarding.close": "Tutup",
    "onboarding.finish": "Selesai",
    "onboarding.open": "Buka",

    // Onboarding Guide
    "onboarding.guide.balance": "Saldo Anda",
    "onboarding.guide.balanceDesc":
      "Lihat total saldo Anda di sini. Ini menampilkan ringkasan keuangan Anda saat ini.",
    "onboarding.guide.addTransaction": "Tambah Transaksi",
    "onboarding.guide.addTransactionDesc":
      "Klik tombol ini untuk menambah transaksi pemasukan atau pengeluaran baru.",
    "onboarding.guide.recentTransactions": "Transaksi Terbaru",
    "onboarding.guide.recentTransactionsDesc":
      "Lihat daftar transaksi terbaru Anda di sini untuk memantau aktivitas keuangan.",
    "onboarding.guide.expenseChart": "Grafik Pengeluaran",
    "onboarding.guide.expenseChartDesc":
      "Pantau pengeluaran Anda berdasarkan kategori dengan grafik interaktif ini.",
    "onboarding.guide.navigation": "Navigasi Menu",
    "onboarding.guide.navigationDesc":
      "Gunakan menu navigasi ini untuk berpindah antara Dashboard, Transaksi, Akun, dan fitur lainnya.",

    // Auth
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.login": "Login",
    "auth.signUp": "Sign Up",
    "auth.forgotPassword": "Lupa Password",
    "auth.forgotPasswordDesc": "Masukkan email Anda dan kami akan mengirim link untuk reset password.",
    "auth.emailPlaceholder": "nama@email.com",
    "auth.sending": "Mengirim...",
    "auth.sendResetLink": "Kirim Link Reset",
    "auth.backToLogin": "Kembali ke Login",

    // Transaction Form
    "transaction.expense": "Pengeluaran",
    "transaction.income": "Pemasukan",
    "transaction.amount": "Jumlah",
    "transaction.quickAmount": "Jumlah Cepat",
    "transaction.account": "Akun",
    "transaction.loadingAccounts": "Loading accounts...",
    "transaction.selectAccount": "Pilih akun",
    "transaction.addNewAccount": "Tambah Akun Baru",
    "transaction.accountName": "Nama Akun",
    "transaction.accountNamePlaceholder": "e.g., Bank BCA, Cash",
    "transaction.initialBalance": "Saldo Awal",
    "transaction.creating": "Membuat...",
    "transaction.createAccount": "Buat Akun",
    "transaction.cancel": "Batal",
    "transaction.categoryOptional": "Kategori (Opsional)",
    "transaction.loadingCategories": "Loading categories...",
    "transaction.noCategoriesIncome": "Tidak ada kategori untuk pemasukan",
    "transaction.noCategoriesExpense": "Tidak ada kategori untuk pengeluaran",
    "transaction.selectCategory": "Pilih kategori",
    "transaction.addNewCategory": "Tambah Kategori Baru",
    "transaction.categoryName": "Nama Kategori",
    "transaction.categoryIncomePlaceholder": "e.g., Gaji, Bonus",
    "transaction.categoryExpensePlaceholder": "e.g., Makanan, Transport",
    "transaction.type": "Tipe",
    "transaction.createCategory": "Buat Kategori",
    "transaction.date": "Tanggal",
    "transaction.selectDate": "Pilih tanggal",
    "transaction.descriptionOptional": "Keterangan (Opsional)",
    "transaction.descriptionPlaceholder": "Tambahkan catatan...",
    "transaction.saving": "Menyimpan...",
    "transaction.save": "Simpan",
    "transaction.uploadReceiptOptional": "Upload Receipt (Opsional)",
    "transaction.uploadedFiles": "File yang Diupload:",
    "transaction.maxFileSize": "Max 5MB (JPEG, PNG, WebP, PDF)",
    "transaction.loadingForm": "Loading form data...",

    // Account Form
    "account.update": "Update Account",
    "account.create": "Create Account",
    "account.balancePlaceholder": "0.00",

    // Category Form
    "category.name": "Nama Kategori",
    "category.namePlaceholder": "contoh: Makanan, Transport, Gaji",
    "category.type": "Tipe",
    "category.selectType": "Pilih tipe",
    "category.income": "Pemasukan",
    "category.expense": "Pengeluaran",
    "category.icon": "Ikon",
    "category.selectIcon": "Pilih ikon",
    "category.update": "Update Kategori",
    "category.create": "Buat Kategori",

    // Goal Form
    "goal.create": "Buat Goal",
    "goal.createNew": "Buat Goal Baru",
    "goal.type": "Tipe Goal",
    "goal.personal": "Goal Pribadi",
    "goal.joint": "Goal Bersama",
    "goal.name": "Nama Goal",
    "goal.namePlaceholder": "contoh: Tabungan Darurat, Liburan Bali",
    "goal.targetAmount": "Target Jumlah (Rp)",
    "goal.amountPlaceholder": "0.00",
    "goal.deadlineOptional": "Deadline (Opsional)",
    "goal.members": "Anggota",
    "goal.selected": "Dipilih",
    "goal.membersSelected": "anggota dipilih",
    "goal.creating": "Membuat...",

    // Goals Page
    "goals.pageTitle": "Goals & Achievements",
    "goals.pageDescription": "Lacak progress tabungan kamu dan dapatkan achievement badges",
    "goals.totalGoals": "Total Goals",
    "goals.completed": "Completed",
    "goals.totalSaved": "Total Saved",
    "goals.targetAmount": "Target Amount",
    "goals.tabGoals": "Goals",
    "goals.tabAchievements": "Pencapaian",
    "goals.personalGoals": "Goal Pribadi",
    "goals.jointGoals": "Goal Bersama",
    "goals.noGoals": "Belum ada goals",
    "goals.noGoalsDescription": "Goals adalah cara terbaik untuk mencapai target finansial kamu. Mulai dengan membuat goal pertama dan kontribusi secara rutin.",
    "goals.noAchievements": "Belum ada pencapaian",
    "goals.noAchievementsDescription": "Selesaikan goals dan capai milestone untuk mendapatkan badge pencapaian.",

    // Install Prompt
    "install.iosInstructions": "Untuk install di iOS:\n1. Tap tombol Share (⬆️)\n2. Pilih \"Add to Home Screen\"\n3. Tap \"Add\"",
    "install.androidInstructions": "Untuk install di Android:\n1. Tap menu (⋮) di browser\n2. Pilih \"Add to Home screen\"\n3. Tap \"Add\"",

    // Offline Indicator
    "offline.cachedDataAvailable": "Data tersimpan tersedia",
    "offline.pendingChanges": "perubahan menunggu sync",

    // Notification Bell
    "notification.title": "Notifikasi",
    "notification.disableSounds": "Matikan suara",
    "notification.enableSounds": "Aktifkan suara",
    "notification.markAllRead": "Tandai semua dibaca",
    "notification.noNewNotifications": "Tidak ada notifikasi baru",
    "notification.allCaughtUp": "Semua sudah terbaca!",
    "notification.budget": "Anggaran",
    "notification.markAsRead": "Tandai dibaca",
    "notification.viewAll": "Lihat semua notifikasi",
    "notification.soundsEnabled": "Suara notifikasi diaktifkan",
    "notification.soundsDisabled": "Suara notifikasi dimatikan",
    "notification.markedAsRead": "Semua notifikasi ditandai dibaca",
    "notification.failedToMark": "Gagal menandai notifikasi dibaca",

    // Accounts Page
    "accounts.pageTitle": "Akun",
    "accounts.loading": "Memuat akun...",
    "accounts.noAccounts": "Belum ada akun",
    "accounts.createAccount": "Buat Akun",
    "accounts.addAccount": "Tambah Akun",
    "accounts.createNewAccount": "Buat Akun Baru",
    "accounts.editAccount": "Edit Akun",
    "accounts.deleteAccount": "Hapus Akun",
    "accounts.deleteAccountConfirm": "Apakah Anda yakin ingin menghapus akun ini? Tindakan ini tidak dapat dibatalkan.",
    "accounts.initialBalance": "Saldo Awal",
    "accounts.currentBalance": "Saldo Saat Ini",
    "accounts.accountDeleted": "Akun berhasil dihapus",
    "accounts.deleteFailed": "Gagal menghapus akun",

    // Categories Page
    "categories.pageTitle": "Kategori",
    "categories.loading": "Memuat kategori...",
    "categories.noCategories": "Belum ada kategori",
    "categories.createCategory": "Buat Kategori",
    "categories.addCategory": "Tambah Kategori",
    "categories.createNewCategory": "Buat Kategori Baru",
    "categories.editCategory": "Edit Kategori",
    "categories.deleteCategory": "Hapus Kategori",
    "categories.deleteCategoryConfirm": "Apakah Anda yakin ingin menghapus kategori \"{name}\"? Tindakan ini tidak dapat dibatalkan.",
    "categories.incomeCategories": "Kategori Pemasukan",
    "categories.expenseCategories": "Kategori Pengeluaran",
    "categories.categoryDeleted": "Kategori berhasil dihapus",
    "categories.deleteFailed": "Gagal menghapus kategori",

    // Transactions Page
    "transactions.pageTitle": "Transaksi",
    "transactions.loading": "Memuat transaksi...",
    "transactions.noTransactions": "Belum ada transaksi",
    "transactions.noTransactionsFiltered": "Tidak ada transaksi yang sesuai dengan kriteria pencarian Anda",
    "transactions.deleteTransaction": "Hapus Transaksi",
    "transactions.deleteTransactionConfirm": "Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.",
    "transactions.transactionDeleted": "Transaksi berhasil dihapus",
    "transactions.deleteFailed": "Gagal menghapus transaksi",
    "transactions.showing": "Menampilkan",
    "transactions.to": "sampai",
    "transactions.of": "dari",
    "transactions.transactions": "transaksi",
    "transactions.previous": "Sebelumnya",
    "transactions.next": "Selanjutnya",
    "transactions.page": "Halaman",
    "transactions.income": "Pemasukan",
    "transactions.expense": "Pengeluaran",

    // Budget Page
    "budget.pageTitle": "Manajemen Anggaran",
    "budget.pageDescription": "Kelola anggaran bulanan dan pantau pengeluaran Anda",
    "budget.recalculate": "Hitung Ulang",
    "budget.recalculating": "Menghitung ulang...",
    "budget.resetMonthly": "Reset Bulanan",
    "budget.resetting": "Mereset...",
    "budget.totalBudgets": "Total Anggaran",
    "budget.activeBudgets": "Anggaran Aktif",
    "budget.overBudget": "Melebihi Anggaran",
    "budget.totalLimit": "Total Limit",
    "budget.tabOverview": "Ringkasan",
    "budget.tabActive": "Anggaran Aktif",
    "budget.tabAlerts": "Peringatan",
    "budget.noBudgets": "Belum ada budget",
    "budget.noBudgetsDescription": "Budget membantu Anda mengontrol pengeluaran. Mulai dengan membuat budget untuk kategori pengeluaran utama.",
    "budget.noActiveBudgets": "Tidak Ada Anggaran Aktif",
    "budget.noActiveBudgetsDescription": "Buat anggaran untuk mulai melacak batas pengeluaran Anda.",
    "budget.overBudgetAlerts": "Peringatan Melebihi Anggaran",
    "budget.allBudgetsOnTrack": "Semua Anggaran Dalam Kontrol",
    "budget.allBudgetsOnTrackDescription": "Kerja bagus! Semua anggaran Anda dalam batas. Teruskan kerja baiknya!",

    // Debts Page
    "debts.pageTitle": "Hutang & Piutang",
    "debts.loading": "Memuat hutang...",
    "debts.noDebts": "Belum ada hutang atau piutang",
    "debts.addDebt": "Tambah Hutang/Piutang",
    "debts.addNew": "Tambah Baru",
    "debts.addNewDebt": "Tambah Hutang atau Piutang Baru",
    "debts.editDebt": "Edit Hutang",
    "debts.deleteDebt": "Hapus Hutang",
    "debts.deleteDebtConfirm": "Apakah Anda yakin ingin menghapus hutang ini? Tindakan ini tidak dapat dibatalkan.",
    "debts.markAsPaid": "Tandai Dibayar",
    "debts.iOwe": "Saya Berhutang",
    "debts.owedToMe": "Berhutang Pada Saya",
    "debts.iOwed": "Saya Berhutang",
    "debts.amount": "Jumlah",
    "debts.due": "Jatuh Tempo",
    "debts.active": "Aktif",
    "debts.paid": "Dibayar",
    "debts.paidStatus": "DIBAYAR",
    "debts.debtDeleted": "Hutang berhasil dihapus",
    "debts.deleteFailed": "Gagal menghapus hutang",

    // Settings Page
    "settings.pageTitle": "Pengaturan",
    "settings.pageDescription": "Kelola preferensi akun dan pengaturan aplikasi Anda.",
    "settings.notifications": "Notifikasi",
    "settings.notificationsDescription": "Kelola preferensi notifikasi dan peringatan Anda",
    "settings.appearance": "Tampilan",
    "settings.appearanceDescription": "Sesuaikan tampilan dan nuansa aplikasi",
    "settings.language": "Bahasa",
    "settings.languageDescription": "Ubah bahasa dan pengaturan regional",
    "settings.account": "Akun",
    "settings.accountDescription": "Perbarui informasi akun dan preferensi Anda",
    "settings.configure": "Konfigurasi",
  },
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.transactions": "Transactions",
    "nav.accounts": "Accounts",
    "nav.categories": "Categories",
    "nav.budget": "Budget",
    "nav.reports": "Reports",
    "nav.debts": "Debts",
    "nav.goals": "Goals",
    "nav.settings": "Settings",
    "nav.more": "More",
    "nav.logout": "Logout",

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
    "dashboard.online": "Online",
    "dashboard.offline": "Offline",
    "dashboard.pending": "pending",
    "dashboard.syncConflict": "Sync conflict",
    "dashboard.other": "Other",

    // Offline Dashboard
    "offline.mode": "Offline Mode",
    "offline.showingCachedData": "Showing last saved data",
    "offline.lastBalance": "Last Balance",
    "offline.cachedAccounts": "Saved Accounts",
    "offline.lastUpdate": "Last update:",
    "offline.cachedCategories": "Saved Categories",
    "offline.offlineMode": "Offline Mode",
    "offline.offlineDescription": "You are viewing data saved on this device. Some features like adding transactions or viewing latest reports require an internet connection.",
    "offline.autoUpdate": "Data will be updated automatically when back online.",

    // Charts
    "charts.incomeVsExpense": "Tren Pemasukan vs Pengeluaran",
    "charts.last12Months": "12 bulan terakhir",
    "charts.amount": "Jumlah",

    // Goals Guide
    "goals.guide.title": "Panduan Goals",
    "goals.guide.subtitle": "Cara Kerja Goals & Cara Mencapainya",
    "goals.guide.flowTitle": "Flow Goals Lengkap",
    "goals.guide.step1.title": "1. Tetapkan Target",
    "goals.guide.step1.description": "Buat goal dengan nama, jumlah target, dan deadline opsional",
    "goals.guide.step1.details": "Misal: 'Tabungan Liburan Bali - Rp 5.000.000' dengan deadline 6 bulan",
    "goals.guide.step2.title": "2. Kontribusi Rutin",
    "goals.guide.step2.description": "Transfer uang dari rekening kamu ke goal secara berkala",
    "goals.guide.step2.details": "Setiap bulan/gajian, alokasikan sebagian untuk goal ini",
    "goals.guide.step3.title": "3. Pantau Progress",
    "goals.guide.step3.description": "Lihat progress bar dan persentase pencapaian goal",
    "goals.guide.step3.details": "Sistem akan tracking otomatis berapa yang sudah terkumpul",
    "goals.guide.step4.title": "4. Raih Achievement",
    "goals.guide.step4.description": "Dapatkan badge dan reward saat goal tercapai",
    "goals.guide.step4.details": "Unlock achievement seperti 'First Goal', 'Millionaire', dll",
    "goals.guide.tipsTitle": "Tips Sukses Capai Goals",
    "goals.guide.tip1.title": "Deadline Realistis",
    "goals.guide.tip1.description": "Set deadline yang masuk akal. Goal jangka panjang (1-2 tahun) lebih sustainable",
    "goals.guide.tip2.title": "Kontribusi Rutin",
    "goals.guide.tip2.description": "Lebih baik sedikit tapi rutin, daripada banyak tapi jarang. Konsistensi adalah kunci",
    "goals.guide.tip3.title": "Break Down Goal",
    "goals.guide.tip3.description": "Bagi goal besar jadi milestone kecil. Misal: Rp 5jt = 10 milestone Rp 500rb",
    "goals.guide.tip4.title": "Track & Celebrate",
    "goals.guide.tip4.description": "Rayakan setiap milestone! Ini akan memotivasi kamu untuk lanjut",
    "goals.guide.exampleTitle": "Contoh Praktis",
    "goals.guide.example.goal": "Tabungan Motor Baru",
    "goals.guide.example.target": "Target: Rp 15.000.000",
    "goals.guide.example.deadline": "Deadline: 12 bulan (1 tahun)",
    "goals.guide.example.contribution": "Kontribusi bulanan: Rp 1.250.000 (dari gaji)",
    "goals.guide.example.progress": "Progress tracking: Lihat setiap bulan berapa yang sudah terkumpul",
    "goals.guide.example.flow": "Flow: Setiap tanggal 25 (gajian) → Transfer Rp 1.250.000 ke goal → Sistem otomatis update progress → Dapat badge milestone setiap Rp 3jt",
    "goals.guide.startButton": "Mulai Buat Goal Pertama Kamu",

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
    "reports.exportDescription":
      "Download your transaction history as CSV or PDF file",
    "reports.totalTransactions": "Total Transactions",
    "reports.totalIncome": "Total Income",
    "reports.totalExpenses": "Total Expenses",
    "reports.inSelectedPeriod": "In selected period",

    // Offline
    "offline.message": "Connection Lost",
    "offline.description": "Some features are limited while offline",

    // Onboarding
    "onboarding.welcome": "Welcome to Monii",
    "onboarding.welcomeDesc":
      "A simple and smart personal finance management app to help you manage your finances easily.",
    "onboarding.transactions": "Record Transactions Easily",
    "onboarding.transactionsDesc":
      "Add your daily income and expenses. Use the camera to automatically scan receipts.",
    "onboarding.accounts": "Manage Accounts & Categories",
    "onboarding.accountsDesc":
      "Set up bank accounts, wallets, and expense categories to make financial tracking easier.",
    "onboarding.reports": "Monitor Financial Progress",
    "onboarding.reportsDesc":
      "View financial reports, expense charts, and AI insights for better financial management.",
    "onboarding.offline": "Offline Support",
    "onboarding.offlineDesc":
      "Access your financial data even without internet connection. Data is stored and synchronized automatically.",
    "onboarding.skip": "Skip",
    "onboarding.next": "Next",
    "onboarding.back": "Back",
    "onboarding.start": "Start",
    "onboarding.close": "Close",
    "onboarding.finish": "Finish",
    "onboarding.open": "Open",

    // Onboarding Guide
    "onboarding.guide.balance": "Your Balance",
    "onboarding.guide.balanceDesc":
      "View your total balance here. This shows a summary of your current finances.",
    "onboarding.guide.addTransaction": "Add Transaction",
    "onboarding.guide.addTransactionDesc":
      "Click this button to add a new income or expense transaction.",
    "onboarding.guide.recentTransactions": "Recent Transactions",
    "onboarding.guide.recentTransactionsDesc":
      "View your recent transactions here to monitor your financial activity.",
    "onboarding.guide.expenseChart": "Expense Chart",
    "onboarding.guide.expenseChartDesc":
      "Monitor your expenses by category with this interactive chart.",
    "onboarding.guide.navigation": "Navigation Menu",
    "onboarding.guide.navigationDesc":
      "Use this navigation menu to switch between Dashboard, Transactions, Accounts, and other features.",

    // Auth
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.login": "Login",
    "auth.signUp": "Sign Up",
    "auth.forgotPassword": "Forgot Password",
    "auth.forgotPasswordDesc": "Enter your email and we'll send you a link to reset your password.",
    "auth.emailPlaceholder": "name@email.com",
    "auth.sending": "Sending...",
    "auth.sendResetLink": "Send Reset Link",
    "auth.backToLogin": "Back to Login",

    // Transaction Form
    "transaction.expense": "Expense",
    "transaction.income": "Income",
    "transaction.amount": "Amount",
    "transaction.quickAmount": "Quick Amount",
    "transaction.account": "Account",
    "transaction.loadingAccounts": "Loading accounts...",
    "transaction.selectAccount": "Select account",
    "transaction.addNewAccount": "Add New Account",
    "transaction.accountName": "Account Name",
    "transaction.accountNamePlaceholder": "e.g., Bank BCA, Cash",
    "transaction.initialBalance": "Initial Balance",
    "transaction.creating": "Creating...",
    "transaction.createAccount": "Create Account",
    "transaction.cancel": "Cancel",
    "transaction.categoryOptional": "Category (Optional)",
    "transaction.loadingCategories": "Loading categories...",
    "transaction.noCategoriesIncome": "No categories for income",
    "transaction.noCategoriesExpense": "No categories for expense",
    "transaction.selectCategory": "Select category",
    "transaction.addNewCategory": "Add New Category",
    "transaction.categoryName": "Category Name",
    "transaction.categoryIncomePlaceholder": "e.g., Salary, Bonus",
    "transaction.categoryExpensePlaceholder": "e.g., Food, Transport",
    "transaction.type": "Type",
    "transaction.createCategory": "Create Category",
    "transaction.date": "Date",
    "transaction.selectDate": "Select date",
    "transaction.descriptionOptional": "Description (Optional)",
    "transaction.descriptionPlaceholder": "Add a note...",
    "transaction.saving": "Saving...",
    "transaction.save": "Save",
    "transaction.uploadReceiptOptional": "Upload Receipt (Optional)",
    "transaction.uploadedFiles": "Uploaded Files:",
    "transaction.maxFileSize": "Max 5MB (JPEG, PNG, WebP, PDF)",
    "transaction.loadingForm": "Loading form data...",

    // Account Form
    "account.update": "Update Account",
    "account.create": "Create Account",
    "account.balancePlaceholder": "0.00",

    // Category Form
    "category.name": "Category Name",
    "category.namePlaceholder": "e.g., Food, Transport, Salary",
    "category.type": "Type",
    "category.selectType": "Select type",
    "category.income": "Income",
    "category.expense": "Expense",
    "category.icon": "Icon",
    "category.selectIcon": "Select icon",
    "category.update": "Update Category",
    "category.create": "Create Category",

    // Goal Form
    "goal.create": "Create Goal",
    "goal.createNew": "Create New Goal",
    "goal.type": "Goal Type",
    "goal.personal": "Personal Goal",
    "goal.joint": "Joint Goal",
    "goal.name": "Goal Name",
    "goal.namePlaceholder": "e.g., Emergency Fund, Bali Vacation",
    "goal.targetAmount": "Target Amount (Rp)",
    "goal.amountPlaceholder": "0.00",
    "goal.deadlineOptional": "Deadline (Optional)",
    "goal.members": "Members",
    "goal.selected": "Selected",
    "goal.membersSelected": "members selected",
    "goal.creating": "Creating...",

    // Goals Page
    "goals.pageTitle": "Goals & Achievements",
    "goals.pageDescription": "Track your savings progress and earn achievement badges",
    "goals.totalGoals": "Total Goals",
    "goals.completed": "Completed",
    "goals.totalSaved": "Total Saved",
    "goals.targetAmount": "Target Amount",
    "goals.tabGoals": "Goals",
    "goals.tabAchievements": "Achievements",
    "goals.personalGoals": "Personal Goals",
    "goals.jointGoals": "Joint Goals",
    "goals.noGoals": "No goals yet",
    "goals.noGoalsDescription": "Goals are the best way to achieve your financial targets. Start by creating your first goal and contribute regularly.",
    "goals.noAchievements": "No achievements yet",
    "goals.noAchievementsDescription": "Complete goals and reach milestones to earn achievement badges.",

    // Install Prompt
    "install.iosInstructions": "To install on iOS:\n1. Tap the Share button (⬆️)\n2. Select \"Add to Home Screen\"\n3. Tap \"Add\"",
    "install.androidInstructions": "To install on Android:\n1. Tap menu (⋮) in browser\n2. Select \"Add to Home screen\"\n3. Tap \"Add\"",

    // Offline Indicator
    "offline.cachedDataAvailable": "Cached data available",
    "offline.pendingChanges": "changes pending sync",

    // Notification Bell
    "notification.title": "Notifications",
    "notification.disableSounds": "Disable sounds",
    "notification.enableSounds": "Enable sounds",
    "notification.markAllRead": "Mark all read",
    "notification.noNewNotifications": "No new notifications",
    "notification.allCaughtUp": "You're all caught up!",
    "notification.budget": "Budget",
    "notification.markAsRead": "Mark as read",
    "notification.viewAll": "View all notifications",
    "notification.soundsEnabled": "Notification sounds enabled",
    "notification.soundsDisabled": "Notification sounds disabled",
    "notification.markedAsRead": "All notifications marked as read",
    "notification.failedToMark": "Failed to mark notifications as read",

    // Accounts Page
    "accounts.pageTitle": "Accounts",
    "accounts.loading": "Loading accounts...",
    "accounts.noAccounts": "No accounts yet",
    "accounts.createAccount": "Create Account",
    "accounts.addAccount": "Add Account",
    "accounts.createNewAccount": "Create New Account",
    "accounts.editAccount": "Edit Account",
    "accounts.deleteAccount": "Delete Account",
    "accounts.deleteAccountConfirm": "Are you sure you want to delete this account? This action cannot be undone.",
    "accounts.initialBalance": "Initial Balance",
    "accounts.currentBalance": "Current Balance",
    "accounts.accountDeleted": "Account deleted successfully",
    "accounts.deleteFailed": "Failed to delete account",

    // Categories Page
    "categories.pageTitle": "Categories",
    "categories.loading": "Loading categories...",
    "categories.noCategories": "No categories yet",
    "categories.createCategory": "Create Category",
    "categories.addCategory": "Add Category",
    "categories.createNewCategory": "Create New Category",
    "categories.editCategory": "Edit Category",
    "categories.deleteCategory": "Delete Category",
    "categories.deleteCategoryConfirm": "Are you sure you want to delete category \"{name}\"? This action cannot be undone.",
    "categories.incomeCategories": "Income Categories",
    "categories.expenseCategories": "Expense Categories",
    "categories.categoryDeleted": "Category deleted successfully",
    "categories.deleteFailed": "Failed to delete category",

    // Transactions Page
    "transactions.pageTitle": "Transactions",
    "transactions.loading": "Loading transactions...",
    "transactions.noTransactions": "No transactions yet",
    "transactions.noTransactionsFiltered": "No transactions match your search criteria",
    "transactions.deleteTransaction": "Delete Transaction",
    "transactions.deleteTransactionConfirm": "Are you sure you want to delete this transaction? This action cannot be undone.",
    "transactions.transactionDeleted": "Transaction deleted successfully",
    "transactions.deleteFailed": "Failed to delete transaction",
    "transactions.showing": "Showing",
    "transactions.to": "to",
    "transactions.of": "of",
    "transactions.transactions": "transactions",
    "transactions.previous": "Previous",
    "transactions.next": "Next",
    "transactions.page": "Page",
    "transactions.income": "Income",
    "transactions.expense": "Expense",

    // Budget Page
    "budget.pageTitle": "Budget Management",
    "budget.pageDescription": "Manage monthly budgets and monitor your expenses",
    "budget.recalculate": "Recalculate",
    "budget.recalculating": "Recalculating...",
    "budget.resetMonthly": "Reset Monthly",
    "budget.resetting": "Resetting...",
    "budget.totalBudgets": "Total Budgets",
    "budget.activeBudgets": "Active Budgets",
    "budget.overBudget": "Over Budget",
    "budget.totalLimit": "Total Limit",
    "budget.tabOverview": "Overview",
    "budget.tabActive": "Active Budgets",
    "budget.tabAlerts": "Alerts",
    "budget.noBudgets": "No budgets yet",
    "budget.noBudgetsDescription": "Budgets help you control spending. Start by creating budgets for your main expense categories.",
    "budget.noActiveBudgets": "No Active Budgets",
    "budget.noActiveBudgetsDescription": "Create budgets to start tracking your spending limits.",
    "budget.overBudgetAlerts": "Over Budget Alerts",
    "budget.allBudgetsOnTrack": "All Budgets On Track",
    "budget.allBudgetsOnTrackDescription": "Great job! All your budgets are within limits. Keep up the good work!",

    // Debts Page
    "debts.pageTitle": "Debts & Receivables",
    "debts.loading": "Loading debts...",
    "debts.noDebts": "No debts or receivables yet",
    "debts.addDebt": "Add Debt/Receivable",
    "debts.addNew": "Add New",
    "debts.addNewDebt": "Add New Debt or Receivable",
    "debts.editDebt": "Edit Debt",
    "debts.deleteDebt": "Delete Debt",
    "debts.deleteDebtConfirm": "Are you sure you want to delete this debt? This action cannot be undone.",
    "debts.markAsPaid": "Mark as Paid",
    "debts.iOwe": "I Owe",
    "debts.owedToMe": "Owed To Me",
    "debts.iOwed": "I Owed",
    "debts.amount": "Amount",
    "debts.due": "Due",
    "debts.active": "Active",
    "debts.paid": "Paid",
    "debts.paidStatus": "PAID",
    "debts.debtDeleted": "Debt deleted successfully",
    "debts.deleteFailed": "Failed to delete debt",

    // Settings Page
    "settings.pageTitle": "Settings",
    "settings.pageDescription": "Manage your account preferences and app settings.",
    "settings.notifications": "Notifications",
    "settings.notificationsDescription": "Manage your notification preferences and alerts",
    "settings.appearance": "Appearance",
    "settings.appearanceDescription": "Customize the look and feel of the app",
    "settings.language": "Language",
    "settings.languageDescription": "Change the language and regional settings",
    "settings.account": "Account",
    "settings.accountDescription": "Update your account information and preferences",
    "settings.configure": "Configure",

    // AI Impact Levels
    "ai.impact.high": "High",
    "ai.impact.medium": "Medium",
    "ai.impact.low": "Low",

    // AI Suggestion Types
    "ai.type.warning": "Warning",
    "ai.type.tip": "Tip",
    "ai.type.goal": "Goal",
    "ai.type.insight": "Insight",

    // AI Risk Levels
    "ai.risk.high": "High",
    "ai.risk.medium": "Medium",
    "ai.risk.low": "Low",

    // Advanced Search Form
    "search.placeholder": "Search by transaction description...",
    "search.clearFilters": "Clear Filters",
    "search.filter": "Filter",
    "search.filterTitle": "Search Filters",
    "search.clearAll": "Clear All",
    "search.transactionType": "Transaction Type",
    "search.allTypes": "All types",
    "search.income": "Income",
    "search.expense": "Expense",
    "search.category": "Category",
    "search.allCategories": "All categories",
    "search.account": "Account",
    "search.allAccounts": "All accounts",
    "search.dateRange": "Date Range",
    "search.from": "From",
    "search.to": "To",
    "search.selectDate": "Select date",
    "search.amountRange": "Amount Range (Rp)",
    "search.minimum": "Minimum",
    "search.maximum": "Maximum",
    "search.unlimited": "Unlimited",
    "search.applyFilters": "Apply Filters",
  },
}

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
    const langTranslations = translations[language as keyof typeof translations];
    // biome-ignore lint/suspicious/noExplicitAny: <>
    return (langTranslations as any)[key] || key;
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
