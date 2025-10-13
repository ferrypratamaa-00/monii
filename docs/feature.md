# KANTONG: Rencana Pengembangan Produk (PRD)

## Nama Aplikasi
Kantong

## Visi Produk
Menjadi mitra finansial pribadi dan keluarga yang paling cerdas dan mudah digunakan, mengubah kebiasaan pencatatan yang membosankan menjadi wawasan yang proaktif dan terpersonalisasi.

## Sasaran Pengguna
Individu, Pasangan, atau Keluarga yang ingin mengelola keuangan harian, membuat anggaran, dan merencanakan tujuan finansial tanpa kerumitan spreadsheet.

## Prinsip Pengembangan
Menerapkan prinsip SOC (Separation of Concerns), DRY (Don't Repeat Yourself), dan KISS (Keep It Simple, Stupid) untuk memastikan kode yang bersih dan scalable.

## 1. Blueprint Arsitektur Teknis

| Komponen          | Pilihan Teknologi                          | Tujuan/Alasan |
|-------------------|--------------------------------------------|---------------|
| Frontend Framework| Next.js (App Router/Server Components)     | Responsif, performa tinggi (PWA-ready), dan server-side rendering untuk SEO (meskipun opsional untuk PWA). |
| Backend/API       | Next.js API Routes / Server Actions        | Monorepo awal, mudah dipisah menjadi microservice (Node.js/Express) di masa depan (sesuai kebutuhan scaling). |
| Database          | PostgreSQL atau SQLite (via Drizzle)       | Keandalan (Postgres) atau kemudahan pengembangan lokal (SQLite). Drizzle menyediakan type safety. |
| ORM               | Drizzle ORM                                | Menyediakan type safety (TypeScript), skema yang jelas, dan mendukung prinsip SOC/DRY. |
| State Management  | TanStack Query (untuk data fetching) & React Context/Zustand (untuk global UI state). | Efisien dalam caching, sinkronisasi, dan manajemen loading states yang kompleks. |
| Komponen UI       | shadcn/ui (berbasis Tailwind CSS)          | Komponen modern, dapat diakses, headless, dan mudah dikustomisasi (sangat mendukung SOC dan DRY). |
| Bahasa Pemrograman| TypeScript (Wajib)                         | Memastikan stabilitas dan mempermudah refactoring di masa depan. |

## 2. Peta Jalan Pengembangan (Roadmap) Berdasarkan Modul

Pengembangan dibagi menjadi tiga tahap utama (Tahap 1, 2, dan 3) sesuai urutan prioritas fungsional.

### Tahap 1: Modul Dasar (MVP)

| ID Modul | Fitur Utama                          | Est. Waktu |
|----------|--------------------------------------|------------|
| M-1.0    | Pengguna & Akun Dasar (Auth)         | 2 Minggu   |
| M-2.0    | Pencatatan Transaksi Harian (Inti)   | 3 Minggu   |
| M-3.0    | Kategori & Akun Dompet               | 2 Minggu   |
| M-4.0    | Laporan Sederhana & Utang Piutang    | 2 Minggu   |

### Tahap 2: Modul Pengelolaan & Analisis

| ID Modul | Fitur Utama                          | Prasyarat     |
|----------|--------------------------------------|---------------|
| M-5.0    | Pengelolaan Anggaran (Budgeting)     | M-2.0, M-3.0 |
| M-6.0    | Laporan Lanjutan (Tren) & Ekspor Data| M-4.0        |
| M-7.0    | Sinkronisasi Cloud & Keamanan Lanjutan| M-1.0       |

### Tahap 3: Modul Diferensiasi (Fitur Unggulan)

| ID Modul | Fitur Utama                          | Prasyarat     |
|----------|--------------------------------------|---------------|
| M-8.0    | Analisis Cerdas (AI-Driven Insights) | M-5.0, M-6.0 |
| M-9.0    | Gamifikasi & Tujuan Bersama          | M-5.0        |
| M-10.0   | Otomatisasi (Scan Struk)             | M-2.0        |

## 3. Spesifikasi Modul Rinci & Alur Pengguna (User Flow)

### Tahap 1: Modul Dasar (MVP)

#### M-1.0: Pengguna & Akun Dasar (Auth)
**Entitas Database:** User (id, email, password_hash, created_at), Session.

**Alur Pengguna (User Flow):**
- Pengguna mengunjungi aplikasi → Halaman Sign Up/Login.
- Pendaftaran: Masukkan Email, Kata Sandi (validasi minimum 8 karakter).
- Login: Autentikasi dan pembuatan token sesi.

**Fitur SOC:** Komponen Auth (formulir) terpisah dari Logic (API Routes/Server Actions).

**Fitur Keamanan:** Password hashing (bcrypt) di backend.

#### M-2.0: Pencatatan Transaksi Harian
**Entitas Database:** Transaction (id, user_id, account_id, category_id, type: ENUM['INCOME', 'EXPENSE'], amount, description, date, is_recurring: BOOL).

**Alur Pengguna (Add New Expense):**
- Pengguna klik Tombol Terapung Global "+".
- Pilih Tipe Transaksi: Pengeluaran.
- Input Nominal (wajib).
- Pilih Akun Sumber (misalnya, 'Cash', 'BCA').
- Pilih Kategori (misalnya, 'Makanan', 'Transportasi').
- Input Deskripsi (opsional).
- Klik "Simpan".

**Logic Backend (Atomic Transaction):**
- Buat record Transaction.
- UPDATE saldo Account terkait: saldo_baru = saldo_lama - nominal.

**DRY Principle:** Logika pembaruan saldo harus diisolasi dalam satu Service Layer Function dan dipanggil oleh API Route.

#### M-3.0: Kategori & Akun Dompet
**Entitas Database:** Category (id, user_id, name, type, icon_name), Account (id, user_id, name, balance, initial_balance, created_at).

**Alur Pengguna (Manage Accounts):**
- Pengguna masuk ke halaman 'Akun Saya'.
- Klik "Tambah Akun Baru".
- Input Nama Akun (e.g., 'BCA', 'Dompet Fisik', 'GoPay').
- Input Saldo Awal (nominal).
- Klik "Simpan".

**Fitur SOC:** Logika CRUD (Create, Read, Update, Delete) untuk Akun dan Kategori menggunakan separate Drizzle Schemas dan API Endpoints.

#### M-4.0: Laporan Sederhana & Utang Piutang
**Entitas Database:** Debt (id, user_id, type: ENUM['DEBT', 'RECEIVABLE'], person_name, amount, due_date, status: ENUM['ACTIVE', 'PAID']).

**Alur Pengguna (Debt Management):**
- Pengguna masuk ke Modul 'Utang & Piutang'.
- Klik "Catat Utang Baru".
- Pilih Tipe: 'Saya Berutang' atau 'Orang Berutang ke Saya'.
- Input Nama Pihak Kedua dan Jumlah.
- Pilih Tanggal Jatuh Tempo.

**Laporan Sederhana:** Di halaman Dashboard, tampilkan Ringkasan Saldo dan Diagram Lingkaran (Category.amount / Total_Expense) untuk periode bulan berjalan.

### Tahap 2: Modul Pengelolaan & Analisis

#### M-5.0: Pengelolaan Anggaran (Budgeting)
**Entitas Database:** Budget (id, user_id, category_id, period: ENUM['MONTHLY', 'YEARLY'], limit_amount, current_spending).

**Alur Pengguna (Set Budget):**
- Pengguna masuk ke halaman 'Anggaran'.
- Klik "Buat Anggaran Baru".
- Pilih Kategori (misalnya, 'Makanan').
- Input Batas Anggaran (misalnya, Rp2.000.000).
- Pilih Periode (Bulanan).

**Logic Backend:** Setelah disimpan, sistem memantau semua transaksi EXPENSE yang masuk ke kategori tersebut.

**Fitur Notifikasi (Frontend/Hook):** Tampilkan pesan peringatan di halaman Anggaran jika current_spending > 80% dari limit_amount.

#### M-6.0: Laporan Lanjutan (Tren) & Ekspor Data
**Perubahan Laporan:** Laporan diperluas untuk menampilkan Grafik Garis (Line Chart) yang membandingkan total pengeluaran/pemasukan selama 6 bulan terakhir.

**Fitur Ekspor:** Tombol "Ekspor Data" di halaman Laporan.

**Logic Backend:** Membuat API Endpoint yang menjalankan kueri Drizzle kompleks untuk menarik semua transaksi dalam periode tertentu dan memformatnya menjadi CSV/PDF di backend sebelum dikirim ke frontend.

#### M-7.0: Sinkronisasi Cloud & Keamanan Lanjutan
**Fitur Wajib:** Implementasi Password Reset via Email (menggunakan layanan seperti SendGrid/Postmark).

**Keamanan Lanjutan:** Opsi Two-Factor Authentication (2FA) sederhana menggunakan Time-based One-Time Password (TOTP).

### Tahap 3: Modul Diferensiasi (Fitur Unggulan)

#### M-8.0: Analisis Cerdas (AI-Driven Insights)
**Logic Backend:** Integrasi dengan Gemini API.

**Alur Pengguna (Insight Generation):**
- Pengguna membuka halaman 'Wawasan Cerdas'.
- Aplikasi mengambil data transaksi 3 bulan terakhir.
- Aplikasi memanggil API (Service Layer) untuk menganalisis data.
- Prompt System (Backend): "Act as a personal financial advisor. Analyze the user's spending habits over the last 90 days, focusing on the top 3 expense categories and any unusual spikes. Provide 3 actionable and encouraging tips to improve savings this month. Data: [JSON data transaksi]."
- Tampilkan hasil saran dari AI kepada pengguna.

#### M-9.0: Gamifikasi & Tujuan Bersama
**Entitas Database:** FinancialGoal (id, user_id, name, target_amount, saved_amount, deadline, type: ENUM['PERSONAL', 'JOINT']), GoalMember (goal_id, user_id, contribution_amount).

**Fitur Gamifikasi:** Tambahkan indikator visual (persentase, progres bar, lencana) pada halaman Anggaran dan Tujuan.

**Fitur Tujuan Bersama:**
- Pengguna membuat Tujuan Bersama (misalnya, "Liburan ke Bali").
- Mengundang anggota lain (via email/user ID).
- Setiap anggota mencatat kontribusi mereka.
- Aplikasi melacak progres kolektif.

#### M-10.0: Otomatisasi (Scan Struk)
**Logic Frontend:** Menggunakan kamera ponsel/laptop untuk mengambil foto.

**Logic Backend (OCR):** Mengirim gambar ke layanan OCR (Optical Character Recognition) atau API yang memiliki kemampuan OCR (misalnya Google Vision API atau model kustom).

**Proses Data:** Backend memproses respons OCR untuk mengekstrak amount, date, dan vendor name, kemudian menyarankan Category kepada pengguna.

**Alur Pengguna:**
- Pengguna memotret struk → Aplikasi menampilkan draf transaksi (Nominal: <extracted_amount>).
- Pengguna hanya perlu mengonfirmasi atau mengoreksi kategori → Simpan.