# KANTONG — PRD + Rencana Pengembangan Super Rinci

## 0) Meta

* [x] Repo Git siap (GitHub/GitLab) + proteksi branch `main` (PR wajib, review minimal 1).
* [x] CI minimal: **Build + Typecheck + Lint + Unit test** (GitHub Actions).
* [x] `.env.example` lengkap (tanpa nilai rahasia).
* [x] Dokumentasi `README.md` + `CONTRIBUTING.md`.
* [x] Color Pallete : E7F2EF, A1C2BD, 708993, 1B3C53
* [x] Style simple, clean Design, modern rounded based
* [x] Mmobile First, Responsive

---

# Fase 0 — Inisiasi & Infrastruktur (PWA, Linting, DB)

## 0.1 Bootstrap Proyek & Kualitas Kode

* [x] **Langkah 0.1.1 — Inisiasi Next.js (App Router, TS, Tailwind, ESLint)**

  ```bash
  bun create next-app@latest kantong-app -- --ts --tailwind --eslint
  cd kantong-app
  ```

  **DoD:** Proyek jalan `bun run dev`, halaman starter tampil.

* [x] **Langkah 0.1.2 — Git init & commit awal**

  ```bash
  git init
  git add .
  git commit -m "chore: initial nextjs project setup"
  git branch -M main
  # git remote add origin <git-remote-url>
  # git push -u origin main
  ```

* [x] **Langkah 0.1.3 — Biome (formatter + linter all-in-one)**

  ```bash
  bun add -D @biomejs/biome
  ```

  **package.json (scripts):**

  ```json
  {
    "scripts": {
      "format": "biome format --write .",
      "lint": "biome lint .",
      "check": "biome check --apply .",
      "typecheck": "tsc --noEmit"
    }
  }
  ```

  **DoD:** `bun run lint` & `bun run format` sukses.

* [x] **Langkah 0.1.4 — Husky + lint-staged (pre-commit)**

  ```bash
  bun add -D husky lint-staged
  bunx husky init
  ```

  **package.json:**

  ```json
  {
    "lint-staged": {
      "*.{ts,tsx,js,jsx}": ["biome check --apply", "git add"]
    }
  }
  ```

  **.husky/pre-commit:**

  ```sh
  #!/usr/bin/env sh
  . "$(dirname -- "$0")/_/husky.sh"

  bunx lint-staged
  ```

  **DoD:** Commit memicu lint-staged otomatis.

## 0.2 Setup PWA

* [x] **Langkah 0.2.1 — Install PWA**

  ```bash
  bun add next-pwa
  ```
* [x] **Langkah 0.2.2 — next.config.mjs**

  ```js
  // next.config.mjs
  import withPWA from 'next-pwa';

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    experimental: {
      serverActions: { allowedOrigins: ['*'] }, // sesuaikan kebutuhan
    },
  };

  export default withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    // runtimeCaching bisa ditambah jika perlu kontrol cache lebih rinci
  })(nextConfig);
  ```
* [x] **Langkah 0.2.3 — Manifest & ikon**

  * **public/manifest.json**

    ```json
    {
      "name": "Kantong",
      "short_name": "Kantong",
      "start_url": "/",
      "display": "standalone",
      "background_color": "#0B1220",
      "theme_color": "#0B1220",
      "description": "Catat keuangan pribadi & keluarga, simpel dan cerdas.",
      "icons": [
        { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
        { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
        { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
      ]
    }
    ```
  * Tambahkan ikon di `public/icons/` (192, 512, maskable).
* [x] **Langkah 0.2.4 — Inject manifest di layout**

  ```tsx
  // src/app/layout.tsx
  export const metadata = { title: 'Kantong' };

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="id">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#0B1220" />
        </head>
        <body>{children}</body>
      </html>
    );
  }
  ```

  **DoD:** Installable (Lighthouse PWA pass), offline caching aktif di production build.

## 0.3 Data Layer (Drizzle, Zod, TanStack Query) + UI Kit

* [x] **Langkah 0.3.1 — Install lib data**

  ```bash
  bun add drizzle-orm zod @tanstack/react-query @tanstack/react-query-next-experimental
  bun add -D drizzle-kit typescript ts-node
  ```

* [x] **Langkah 0.3.2 — Drizzle config**

  ```bash
  # pilih salah satu target db; contoh postgres (neon/supabase) atau sqlite lokal
  bun add -D @types/node
  bun add pg # jika pakai Postgres
  bun add better-sqlite3 # jika pakai SQLite
  ```

  **drizzle.config.ts**

  ```ts
  import { defineConfig } from 'drizzle-kit';

  export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: process.env.DB_DIALECT === 'sqlite' ? 'sqlite' : 'postgresql',
    dbCredentials:
      process.env.DB_DIALECT === 'sqlite'
        ? { url: './.data/kantong.db' }
        : {
            url: process.env.DATABASE_URL!, // postgres connection url
          },
    strict: true,
    verbose: true
  });
  ```

* [x] **Langkah 0.3.3 — Struktur DB & koneksi**

  ```
  src/db/
  ├─ index.ts           # koneksi db
  ├─ schema.ts          # semua skema & relations
  ├─ seeds/             # seed data dev
  └─ utils.ts           # helper db (trx wrappers, etc.)
  ```

  **src/db/index.ts (contoh Postgres)**

  ```ts
  import { drizzle } from 'drizzle-orm/node-postgres';
  import { Pool } from 'pg';

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  export const db = drizzle(pool, { logger: process.env.NODE_ENV === 'development' });
  ```

  **src/db/index.ts (contoh SQLite dev)**

  ```ts
  import Database from 'better-sqlite3';
  import { drizzle } from 'drizzle-orm/better-sqlite3';

  const sqlite = new Database('./.data/kantong.db');
  export const db = drizzle(sqlite);
  ```

* [x] **Langkah 0.3.4 — Skema dasar (User, Account, Category, Transaction, Debt)**

  ```ts
  // src/db/schema.ts
  import { pgTable, serial, integer, text, varchar, timestamp, boolean, numeric, pgEnum } from 'drizzle-orm/pg-core';
  import { relations } from 'drizzle-orm';

  export const txTypeEnum = pgEnum('tx_type', ['INCOME', 'EXPENSE']);
  export const debtTypeEnum = pgEnum('debt_type', ['DEBT', 'RECEIVABLE']);
  export const debtStatusEnum = pgEnum('debt_status', ['ACTIVE', 'PAID']);

  export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  });

  export const accounts = pgTable('accounts', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    initialBalance: numeric('initial_balance', { precision: 14, scale: 2 }).default('0').notNull(),
    balance: numeric('balance', { precision: 14, scale: 2 }).default('0').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  });

  export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    type: txTypeEnum('type').notNull(),
    iconName: varchar('icon_name', { length: 64 }).default('Circle')
  });

  export const transactions = pgTable('transactions', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    accountId: integer('account_id').references(() => accounts.id).notNull(),
    categoryId: integer('category_id').references(() => categories.id),
    type: txTypeEnum('type').notNull(),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    description: text('description'),
    date: timestamp('date').defaultNow().notNull(),
    isRecurring: boolean('is_recurring').default(false).notNull()
  });

  export const debts = pgTable('debts', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    type: debtTypeEnum('type').notNull(),
    personName: varchar('person_name', { length: 100 }).notNull(),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    dueDate: timestamp('due_date'),
    status: debtStatusEnum('status').default('ACTIVE').notNull()
  });

  // relations (opsional, untuk eager typed)
  export const usersRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
    transactions: many(transactions),
    debts: many(debts),
    categories: many(categories),
  }));
  ```

* [x] **Langkah 0.3.5 — shadcn/ui**

  ```bash
  bunx shadcn-ui@latest init
  bunx shadcn-ui@latest add button input form dialog toast separator card progress badge
  ```

  **DoD:** Komponen UI dasar tersedia.

* [x] **Langkah 0.3.6 — TanStack Query Provider**

  ```tsx
  // src/app/providers.tsx
  'use client';
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
  import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
  import { useState } from 'react';

  export default function Providers({ children }: { children: React.ReactNode }) {
    const [client] = useState(() => new QueryClient());
    return (
      <QueryClientProvider client={client}>
        <ReactQueryStreamedHydration>{children}</ReactQueryStreamedHydration>
      </QueryClientProvider>
    );
  }
  ```

  ```tsx
  // src/app/layout.tsx
  import Providers from './providers';
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="id">
        <head><link rel="manifest" href="/manifest.json" /></head>
        <body><Providers>{children}</Providers></body>
      </html>
    );
  }
  ```

* [x] **Langkah 0.3.7 — Commit Infrastruktur**

  ```bash
  git checkout -b feat/setup-infra
  bunx drizzle-kit generate
  # bunx drizzle-kit push:pg   # jika Postgres
  # bunx drizzle-kit push      # jika SQLite
  git add .
  git commit -m "feat(infra): PWA, Drizzle, Zod, Biome, shadcn/ui, React Query setup"
  git push -u origin feat/setup-infra
  git checkout main
  git merge feat/setup-infra --no-ff
  git push
  ```

---

# Struktur Folder Modular (scalable, SOC)

```
src/
├─ app/
│  ├─ (public)/
│  │  ├─ login/page.tsx
│  │  └─ signup/page.tsx
│  ├─ (protected)/
│  │  ├─ dashboard/page.tsx
│  │  ├─ transactions/page.tsx
│  │  ├─ accounts/page.tsx
│  │  ├─ categories/page.tsx
│  │  ├─ budget/page.tsx
│  │  ├─ reports/page.tsx
│  │  ├─ ai-insights/page.tsx
│  │  └─ goals/page.tsx
│  ├─ api/
│  │  ├─ export/route.ts
│  │  └─ auth/route.ts (opsional, jika tidak pakai Server Actions)
│  ├─ actions/            # Server Actions (thin)
│  │  ├─ auth.ts
│  │  ├─ transaction.ts
│  │  ├─ account.ts
│  │  ├─ category.ts
│  │  ├─ budget.ts
│  │  ├─ debt.ts
│  │  ├─ export.ts
│  │  └─ goal.ts
│  ├─ layout.tsx
│  └─ providers.tsx
├─ components/
│  ├─ app/
│  │  ├─ auth/ (LoginForm, SignUpForm)
│  │  ├─ transactions/ (TransactionForm, TransactionModal, CameraCaptureModal, ReviewTransactionModal)
│  │  ├─ accounts/ (AccountList, AccountForm)
│  │  ├─ categories/ (CategoryManager, CategoryForm)
│  │  ├─ dashboard/ (KPICards, PieChart, LineChart)
│  │  ├─ budget/ (BudgetForm, BudgetProgressBar)
│  │  ├─ ai/ (AISuggestionCard)
│  │  └─ goals/ (GoalProgressCard, BadgeDisplay)
│  ├─ forms/ (FormWrapper, ZodFormResolver)
│  └─ ui/ (re-exports shadcn custom)
├─ db/ (index.ts, schema.ts, seeds/, utils.ts)
├─ lib/
│  ├─ validations/ (auth.ts, transaction.ts, account.ts, category.ts, budget.ts, debt.ts, goal.ts)
│  ├─ security/ (csrf.ts, rate-limit.ts, totp.ts, crypto.ts)
│  ├─ pwa/ (workbox-config.ts optional)
│  ├─ csv/ (stringify.ts)
│  └─ utils.ts
├─ services/
│  ├─ auth.ts
│  ├─ transaction.ts
│  ├─ account.ts
│  ├─ category.ts
│  ├─ dashboard.ts
│  ├─ budget.ts
│  ├─ debt.ts
│  ├─ export.ts
│  ├─ ai.ts
│  ├─ goal.ts
│  └─ ocr.ts
├─ styles/ (globals.css, themes.css)
└─ types/ (domain.d.ts, api.d.ts)
```

**Aturan SOC:**

* **Actions**: tipis, hanya **memanggil service**, handle input Zod + error mapping.
* **Services**: semua **bisnis & transaksi DB** (atomic).
* **Components**: murni UI + TanStack Query hooks.
* **lib/validations**: semua skema Zod konsisten.

---

# Fase 1 — MVP (M-1.0 s/d M-4.0)

## M-1.0 — Pengguna & Akun Dasar (Auth)

**Checklist**

* [x] **1.1.1 Validasi (Zod) — `src/lib/validations/auth.ts`**

  ```ts
  import { z } from 'zod';

  export const SignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8)
  }).refine((d) => d.password === d.confirmPassword, {
    message: 'Konfirmasi sandi tidak cocok', path: ['confirmPassword']
  });

  export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
  });
  ```

* [x] **1.1.2 Service — `src/services/auth.ts`**

  ```ts
  import { db } from '@/db';
  import { users } from '@/db/schema';
  import { eq } from 'drizzle-orm';
  import bcrypt from 'bcryptjs';

  export async function registerUser(data: z.infer<typeof SignupSchema>) {
    const email = data.email.toLowerCase().trim();
    const hash = await bcrypt.hash(data.password, 12);
    // insert + handle unique violation
  }

  export async function verifyCredentials(email: string, password: string) {
    const user = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase().trim()) });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : null;
  }
  ```

  > **Catatan:** Sesi bisa via **HttpOnly cookie** (Server Actions) atau integrasi ke penyedia (mis. Lucia/NextAuth) — tetap jaga SOC.

* [x] **1.1.3 Actions — `src/app/actions/auth.ts`**

  * `signUpAction(formData)` → parse Zod → `authService.registerUser` → set cookie sesi.
  * `loginAction(formData)` → parse Zod → `authService.verifyCredentials` → set cookie sesi.
  * Error mapping: `ZodError` → field errors; lainnya → toast generic.

* [x] **1.1.4 Komponen — `LoginForm.tsx` & `SignUpForm.tsx`**

  * `react-hook-form` + Zod resolver (atau shadcn form).
  * Pakai `useMutation` dari TanStack Query (untuk spinner, error, success).
  * UX: disable button saat loading, fokus pertama di email, keyboard submit.

**Acceptance Criteria**

* Bisa daftar & login, sesi persist (HttpOnly).
* Validasi ketat, pesan jelas.
* Tes happy-path & error-path (unit/service).

---

## M-2.0 — Pencatatan Transaksi Harian

**Checklist**

* [x] **1.2.1 Validasi — `src/lib/validations/transaction.ts`**

  ```ts
  export const TransactionSchema = z.object({
    accountId: z.number().int().positive(),
    categoryId: z.number().int().optional(),
    type: z.enum(['INCOME','EXPENSE']),
    amount: z.number().finite().refine(v => v !== 0, 'Amount tidak boleh 0'),
    description: z.string().max(500).optional(),
    date: z.coerce.date(),
    isRecurring: z.boolean().default(false)
  }).refine(d => d.type === 'INCOME' ? d.amount > 0 : d.amount < 0, {
    message: 'INCOME harus positif, EXPENSE harus negatif', path: ['amount']
  });
  ```

* [x] **1.2.2 Service (KRITIS Atomic) — `src/services/transaction.ts`**

  ```ts
  import { db } from '@/db';
  import { transactions, accounts } from '@/db/schema';
  import { eq, sql } from 'drizzle-orm';

  export async function createTransaction(input: TransactionInput) {
    return db.transaction(async (tx) => {
      const [trx] = await tx.insert(transactions).values({
        ...input,
        // userId terambil dari context (server action)
      }).returning();

      // Update saldo atomic (balance = balance + amount)
      await tx.update(accounts)
        .set({ balance: sql`${accounts.balance} + ${input.amount}` })
        .where(eq(accounts.id, input.accountId));

      return trx;
    });
  }
  ```

* [x] **1.2.3 Action — `src/app/actions/transaction.ts`**

  * `createTransactionAction(formData)` → parse Zod → `service.createTransaction`.

* [x] **1.2.4 UI — `TransactionForm.tsx`, `TransactionModal.tsx`**

  * Reusable form (DRY), pilih akun, kategori, tipe, tanggal.
  * `useMutation` + invalidasi query daftar transaksi & saldo akun.

**Acceptance Criteria**

* Transaksi tersimpan & saldo akun berubah **atomically**.
* UX halus (loading state, error toast).
* Tes: rollback bila salah satu langkah gagal.

---

## M-3.0 — Kategori & Akun Dompet

**Checklist**

* [x] **1.3.1 Services — `account.ts`, `category.ts`**
  CRUD sederhana (create/get/update/delete) ter-scoped ke `userId`.

* [x] **1.3.2 FormWrapper — `src/components/forms/FormWrapper.tsx`**

  * Menerima `zodSchema`, `defaultValues`, `onSubmit`, render prop children.
  * Tangani error & loading generik.

* [x] **1.3.3 UI Akun — `AccountList.tsx`, `AccountForm.tsx`**

  * List akun + modal tambah/edit.
  * Tampilkan saldo saat ini & saldo awal.

* [x] **1.3.4 UI Kategori — `CategoryManager.tsx`, `CategoryForm.tsx`**

  * CRUD kategori (type: INCOME/EXPENSE), icon picker simple.

**Acceptance Criteria**

* CRUD akun & kategori berjalan, validasi aman.
* Tidak ada duplikasi logika form (DRY via `FormWrapper`).

---

## M-4.0 — Laporan Sederhana & Utang Piutang

**Checklist**

* [x] **1.4.1 Skema Debt (sudah di schema.ts)**

* [x] **1.4.2 Dashboard Service — `src/services/dashboard.ts`**

  ```ts
  export async function getTotalBalance(userId: number) { /* SUM balance semua akun */ }
  export async function getMonthlySummary(userId: number) {
    // SUM(amount) income & expense untuk bulan berjalan (date_trunc('month', date))
  }
  ```

* [x] **1.4.3 Debt Service — `src/services/debt.ts`**

  * CRUD + `markAsPaid(debtId)` (ubah status + optional transaksi balancing jika diinginkan)

* [x] **1.4.4 Halaman Dashboard**

  * `src/app/(protected)/dashboard/page.tsx`
  * Kartu ringkasan saldo & pie pengeluaran bulan berjalan.

* [x] **1.4.5 Visualisasi — `PieChart.tsx`**

  * Gunakan chart lib (mis. `recharts`):

    ```bash
    bun add recharts
    ```

**Acceptance Criteria**

* Dashboard tampil ringkasan dan pie chart kategori expense bulan ini.
* Utang/piutang CRUD + status berjalan.

---

# Fase 2 — Pengelolaan & Analisis (M-5.0 s/d M-7.0)

## M-5.0 — Pengelolaan Anggaran (Budgeting)

**Checklist**

* [x] **2.1.1 Skema Budget**

  ```ts
  // schema.ts
  export const periodEnum = pgEnum('budget_period', ['MONTHLY','YEARLY']);
  export const budgets = pgTable('budgets', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    categoryId: integer('category_id').references(() => categories.id).notNull(),
    period: periodEnum('period').default('MONTHLY').notNull(),
    limitAmount: numeric('limit_amount',{ precision:14, scale:2 }).notNull(),
    currentSpending: numeric('current_spending',{ precision:14, scale:2 }).default('0').notNull()
  });
  ```

* [x] **2.1.2 Service — `budget.ts`**
  CRUD + `updateBudgetSpending(categoryId, amount)`.

* [x] **2.1.3 Integrasi Kritis — modify `createTransaction`**
  Setelah update balance, panggil:

  ```ts
  if (input.type === 'EXPENSE' && input.categoryId) {
    await budgetService.updateBudgetSpending(input.categoryId, Math.abs(input.amount));
  }
  ```

* [x] **2.1.4 UI — `BudgetProgressBar.tsx`**

  * Warna dinamis: <60% hijau, 60-80% kuning, >80% merah.
  * Tooltip sisa anggaran & estimasi hari.

**Acceptance Criteria**

* Budget otomatis ter-update saat transaksi expense dibuat.
* Peringatan muncul saat >80%.

---

## M-6.0 — Laporan Lanjutan (Tren) & Ekspor Data

**Checklist**

* [x] **2.2.1 Dashboard Service — `getMonthlyTrendData(userId, numMonths)`**

  * Agregasi per bulan (`date_trunc` / raw SQL) untuk 12 bulan terakhir.

* [x] **2.2.2 Ekspor Service — `src/services/export.ts`**

  * `generateTransactionCSV(userId, filter)` → string CSV.
  * **lib/csv/stringify.ts**: util sederhana (hindari dep besar jika bisa).

* [x] **2.2.3 API Ekspor — `src/app/api/export/route.ts`**

  ```ts
  import { NextResponse } from 'next/server';
  export async function GET(req: Request) {
    // parse query, panggil service, return CSV
    return new NextResponse(csvString, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="kantong-export.csv"'
      }
    });
  }
  ```

* [x] **2.2.4 Visualisasi — `LineChart.tsx`**

  * Bandingkan income vs expense 12 bulan.

**Acceptance Criteria**

* Grafik tren 12 bulan tampil.
* Tombol “Ekspor CSV” mengunduh file dengan filter.

---

## M-7.0 — Sinkronisasi Cloud & Keamanan Lanjutan

**Checklist**

* [x] **2.3.1 ErrorBoundary (frontend)**

  * Komponen `ErrorBoundary` + `fallback UI` di layout protected.

* [x] **2.3.2 Password Reset Flow (Service Layer)**

  * Tabel `password_resets` (token, userId, expiresAt, usedAt).
  * Generate token kriptografis, kirim email via **Postmark/SendGrid**.
  * Endpoint/action untuk verifikasi & set password baru.

* [x] **2.3.3 Backup Service — `createFullDataBackup(userId)`**

  * Dump semua entitas pengguna → objek JSON siap unduh.

* [x] **2.3.4 UI — Tombol “Unduh Backup Data”**

  * Server Action mengembalikan file JSON.

**Acceptance Criteria**

* Reset password berfungsi (email diterima, token valid/expired ditangani).
* Backup JSON terunduh lengkap.

---

# Fase 3 — Diferensiasi (M-8.0 s/d M-10.0)

## M-8.0 — Analisis Cerdas (AI-Driven)

**Checklist**

* [x] **3.1.1 AI Service — `src/services/ai.ts`**

  * **Ambil agregat**: top 3 kategori, rata-rata pengeluaran harian, spike outlier.
  * Hindari kirim raw transaksi (hemat token/biaya).

* [x] **3.1.2 Prompt Engineering (Gemini)**

  ```
  System: "Anda adalah Penasihat Finansial KANTUNG. Berikan 3 saran spesifik, bernada suportif, berbasis data agregat."
  User: {json data agregat 90 hari}
  ```

* [x] **3.1.3 Panggilan API Gemini**

  * `GEMINI_API_KEY` via env, panggil SDK/REST dari server.
  * Sanitasi input, timeout, retry.

* [x] **3.1.4 UI — `AISuggestionCard.tsx`**

  * Skeleton loader, error state yang ramah.
  * **Menampilkan hasil saran AI** ke pengguna.

**Acceptance Criteria**

* Halaman “Wawasan Cerdas” menampilkan 3 tips actionable berbasis data user.

---

## M-9.0 — Gamifikasi & Tujuan Bersama

**Checklist**

* [x] **3.2.1 Skema Goal + Member + Badge**

  ```ts
  export const goals = pgTable('goals', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    name: varchar('name',{ length:120 }).notNull(),
    targetAmount: numeric('target_amount',{ precision:14, scale:2 }).notNull(),
    savedAmount: numeric('saved_amount',{ precision:14, scale:2 }).default('0').notNull(),
    deadline: timestamp('deadline'),
    type: pgEnum('goal_type',['PERSONAL','JOINT'])('type').default('PERSONAL').notNull()
  });

  export const goalMembers = pgTable('goal_members', {
    goalId: integer('goal_id').references(() => goals.id).notNull(),
    userId: integer('user_id').references(() => users.id).notNull(),
    contributionAmount: numeric('contribution_amount',{ precision:14, scale:2 }).default('0').notNull()
  }, (t) => ({ pk: primaryKey({ columns: [t.goalId, t.userId] }) }));

  export const badges = pgTable('badges', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    code: varchar('code',{ length:64 }).notNull(), // e.g. BUDGET_MASTER
    earnedAt: timestamp('earned_at').defaultNow().notNull()
  });
  ```

* [x] **3.2.2 Services — goal.ts**

  * `createJointGoal(data, members)`
  * `contributeToGoal(goalId, amount)` (atomic: kurangi saldo akun contributor, tambah savedAmount goal).

* [x] **3.2.3 Badge logic**

  * Rule engine sederhana (mis. sukses 3 bulan berturut-turut di bawah budget).

* [x] **3.2.4 UI**

  * `GoalProgressCard.tsx` + `BadgeDisplay.tsx`.

**Acceptance Criteria**

* Tujuan bersama dapat dibuat, member ditambahkan, kontribusi tercatat atomically.
* Badge muncul saat rule terpenuhi.

---

## M-10.0 — Otomatisasi (Scan Struk/OCR)

**Checklist**

* [x] **3.3.1 OCR Service — `src/services/ocr.ts`**

  * `processReceiptImage(file)` → base64 → kirim ke Vision/OCR API → normalisasi output `{vendor, amount, date}`.

* [x] **3.3.2 Frontend Capture — `CameraCaptureModal.tsx`**

  * Akses kamera/upload, preview, kirim ke server action.

* [x] **3.3.3 Review Screen (KRITIS) — `ReviewTransactionModal.tsx`**

  * Menampilkan gambar & hasil OCR (editable): vendor, jumlah, tanggal, saran kategori.
  * **Wajib:** user mengonfirmasi/ubah sebelum `createTransactionAction`.

* [x] **3.3.4 Update Action — `createTransactionAction`**

  * Menerima data dari review, normalisasi, lanjut ke service atomic.

**Acceptance Criteria**

* Alur: ambil foto → OCR → review & koreksi → simpan transaksi berjalan mulus.

---

# Panduan Keamanan (Security Playbook)

**Konfigurasi & Secret**

* [x] `.env` hanya dibaca server. Commit **hanya** `.env.example`.
* [ ] Rotasi kunci API (Gemini/OCR/Email) berkala, beri scope minimal.

**Autentikasi & Sesi**

* [x] Cookie **HttpOnly**, `Secure`, `SameSite=Lax/Strict`. Simpan minimal claims (userId, iat, exp).
* [x] Hash password **bcrypt** dengan cost 12 (atau **argon2id** jika memungkinkan).
* [x] Rate limiting brute-force login (IP + account), exponential backoff.
* [ ] **2FA (TOTP)** opsional di M-7.0.

**Autorisasi**

* [x] Semua query service **mewajibkan userId** (multi-tenant boundary).
* [x] Akses resource selalu `WHERE user_id = currentUserId`.

**Validasi & Sanitasi**

* [x] **Zod** di boundaries (actions/API). Tolak input di luar skema.
* [ ] Hindari XSS: encode output, tidak inject HTML dari user.
* [ ] File upload: validasi MIME/ukuran, scan jika perlu, simpan privat.

**Transport & Headers**

* [x] **HTTPS** wajib.
* [x] Tambahkan security headers (via `next/headers` atau middleware):

  * `Content-Security-Policy` (default-src 'self'; img/media sesuai kebutuhan)
  * `X-Frame-Options: DENY`
  * `X-Content-Type-Options: nosniff`
  * `Referrer-Policy: strict-origin-when-cross-origin`
  * `Permissions-Policy` minimal

**PWA & SW**

* [ ] Service Worker tidak meng-cache response sensitif.
* [ ] Offline UI tidak membeberkan data user jika tidak ter-enkripsi lokal.

**DB & Transaksi**

* [x] Semua operasi finansial **atomic** (Drizzle `db.transaction`).
* [x] Gunakan **numeric(14,2)** untuk nilai uang; hindari float.

**Logging & Audit**

* [x] Log kesalahan tanpa rahasia (PII/secret).
* [x] Jejak audit untuk tindakan penting (ganti sandi, reset, ekspor, backup).

**Email & Reset**

* [ ] Token reset: acak kriptografis, sekali pakai, kadaluarsa (≤ 30 menit).
* [x] Jangan leak apakah email terdaftar (pesan generik).

---

# CI/CD & Kualitas

**Dev Script**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "biome lint .",
    "format": "biome format --write .",
    "check": "biome check --apply .",
    "typecheck": "tsc --noEmit",
    "db:gen": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate" // jika pakai migrasi file-based
  }
}
```

**GitHub Actions (ringkas)**

* [x] Workflow: `on: [push, pull_request]`
* [x] Steps: `setup-node`, `bun ci`, `bun run typecheck`, `bun run lint`, `bun run build`, jalankan unit tests.

**Testing (disarankan)**

* [x] **Vitest** untuk unit/service

  ```bash
  bun add -D vitest @testing-library/react @testing-library/jest-dom
  ```
* [x] **Playwright** untuk e2e PWA

  ```bash
  bun add -D @playwright/test
  ```

---

# DoR & DoD per Fase

**Definition of Ready (DoR)**

* PRD & acceptance criteria jelas.
* Skema & migrasi disiapkan.
* Validasi Zod tersedia.

**Definition of Done (DoD)**

* Fitur memenuhi acceptance criteria.
* Lintas: typecheck, lint, unit tests lulus.
* UI states: loading/error/empty ter-handle.
* Dokumen singkat di PR (how-to & demo gif).

---

# Roadmap & Checklist Global (Ringkas)

### Fase 0 — Infrastruktur

* [x] Next.js + TS + Tailwind + ESLint
* [x] Biome + Husky + lint-staged
* [x] PWA (manifest, SW, ikon)
* [x] Drizzle (config + koneksi)
* [x] shadcn/ui + TanStack Query
* [x] Commit infra → merge

### Fase 1 — MVP

* [x] **M-1.0 Auth** (Zod, service, actions, forms)
* [x] **M-2.0 Transaksi** (Zod, atomic create, actions, UI)
* [x] **M-3.0 Kategori & Akun** (CRUD + FormWrapper)
* [x] **M-4.0 Dashboard & Debt** (summary, pie, debt CRUD)

### Fase 2 — Pengelolaan & Analisis

* [x] **M-5.0 Budget** (skema, service, integrasi createTransaction, progress bar)
* [x] **M-6.0 Tren & Ekspor** (trend query 12 bln, CSV API, line chart)
* [x] **M-7.0 Security+Sync** (ErrorBoundary, reset password, backup JSON)

### Fase 3 — Diferensiasi

* [x] **M-8.0 AI Insights** (agregat → AI analysis → AISuggestionsPanel + dashboard integration)
* [x] **M-9.0 Goal & Badges** (joint goal atomic, badges)
* [x] **M-10.0 OCR** (capture → OCR → review → transaksi)

---

## Catatan Implementasi Penting

* **State server vs client**: letakkan semua **mutasi** pada **Server Actions** → aman & konsisten; UI pakai **TanStack Query** untuk fetch dan cache.
* **Error UX**: gunakan `useToast` dari shadcn untuk pesan; fallback UI di error boundary.
* **A11y**: komponen form label-for, keyboard navigable; warna progress memperhatikan kontras.
* **I18n (opsional)**: strukturkan string agar mudah diterjemahkan (id default).
* **Performance**: gunakan **React Server Components** untuk data statis; `revalidate` untuk caching laporan; lazy-import chart.

---

# Fitur Tambahan & Optimisasi (Phase 4)

## Performance Monitoring

**Checklist**

* [ ] **4.1.1 Install Monitoring Tools**

  ```bash
  bun add @vercel/analytics nextjs-bundle-analyzer
  bun add -D @next/bundle-analyzer
  ```

  **DoD:** Tools terinstall untuk metrics collection.

* [ ] **4.1.2 Metrics Collection — `src/lib/performance.ts`**

  ```ts
  import { NextWebVitalsMetric } from 'next/app';

  export function reportWebVitals(metric: NextWebVitalsMetric) {
    // Kirim ke analytics service (Vercel, Google Analytics, dll)
    console.log(metric); // placeholder
  }
  ```

  **src/app/layout.tsx:**

  ```tsx
  import { reportWebVitals } from '@/lib/performance';

  export function reportWebVitals(metric) {
    // Implementasi
  }
  ```

* [ ] **4.1.3 Error Tracking — Install Sentry**

  ```bash
  bun add @sentry/nextjs
  ```

  **sentry.client.config.js & sentry.server.config.js** sesuai dokumentasi Sentry.

* [ ] **4.1.4 Performance Budgets — CI/CD Enhancement**

  Update `.github/workflows/ci-cd.yml`:

  ```yaml
  - name: Performance Check
    run: bun run build:analyze
    # Tambah threshold untuk bundle size
  ```

**Acceptance Criteria**

* Web vitals (LCP, FID, CLS) ter-track dan dilaporkan.
* Error otomatis dilaporkan ke Sentry tanpa PII.

---

## Internationalization (i18n)

**Checklist**

* [ ] **4.2.1 Install next-intl**

  ```bash
  bun add next-intl
  ```

* [ ] **4.2.2 Setup i18n Config — `src/i18n.ts`**

  ```ts
  import { createSharedPathnamesNavigation } from 'next-intl/navigation';
  import { defineRouting } from 'next-intl/routing';

  export const routing = defineRouting({
    locales: ['id', 'en'],
    defaultLocale: 'id'
  });

  export const { Link, redirect, usePathname, useRouter } =
    createSharedPathnamesNavigation(routing);
  ```

* [ ] **4.2.3 Translation Files — `src/messages/`**

  * `id.json`: {"nav.dashboard": "Dasbor", ...}
  * `en.json`: {"nav.dashboard": "Dashboard", ...}

* [ ] **4.2.4 Middleware — `src/middleware.ts` (update)**

  Tambah locale detection.

* [ ] **4.2.5 UI Integration — `useTranslations` hook**

  ```tsx
  import { useTranslations } from 'next-intl';

  export default function Component() {
    const t = useTranslations('nav');
    return <h1>{t('dashboard')}</h1>;
  }
  ```

**Acceptance Criteria**

* App mendukung bahasa Indonesia & English, switcher di header.
* Semua string UI ter-translate.

---

## Accessibility Features (A11y)

**Checklist**

* [ ] **4.3.1 ARIA Labels & Roles**

  Update semua komponen form & interactive:

  ```tsx
  <button aria-label="Tambah transaksi" aria-describedby="add-desc">
    <PlusIcon aria-hidden="true" />
  </button>
  ```

* [ ] **4.3.2 Keyboard Navigation**

  * Tab order logis, skip links untuk main content.
  * Enter/Space untuk buttons, Arrow keys untuk dropdowns.

* [ ] **4.3.3 Screen Reader Support**

  * Alt text untuk charts & icons.
  * Live regions untuk notifications.

* [ ] **4.3.4 Color Contrast & Focus Indicators**

  * Pastikan kontras ≥4.5:1.
  * Focus ring visible & tidak bergantung warna saja.

* [ ] **4.3.5 Testing — axe-core**

  ```bash
  bun add -D @axe-core/playwright
  ```

  Update Playwright tests dengan accessibility checks.

**Acceptance Criteria**

* Lighthouse Accessibility score ≥90.
* Navigasi keyboard penuh, screen reader compatible.

---

## Dark Mode Support

**Checklist**

* [ ] **4.4.1 CSS Variables — `src/styles/themes.css`**

  ```css
  :root {
    --bg: #ffffff;
    --text: #000000;
    /* ... */
  }

  [data-theme="dark"] {
    --bg: #0b1220;
    --text: #ffffff;
    /* ... */
  }
  ```

* [ ] **4.4.2 Theme Provider — `src/components/ThemeProvider.tsx`**

  ```tsx
  'use client';
  import { createContext, useContext, useEffect, useState } from 'react';

  const ThemeContext = createContext<{ theme: string; setTheme: (t: string) => void }>(null!);

  export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
      const saved = localStorage.getItem('theme') || 'light';
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }, []);

    const updateTheme = (newTheme: string) => {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
      <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  export const useTheme = () => useContext(ThemeContext);
  ```

* [ ] **4.4.3 Toggle Component — `src/components/ThemeToggle.tsx`**

  ```tsx
  'use client';
  import { useTheme } from './ThemeProvider';
  import { MoonIcon, SunIcon } from 'lucide-react';

  export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>
    );
  }
  ```

* [ ] **4.4.4 Update Layout**

  Wrap app dengan `<ThemeProvider>` di `layout.tsx`.

**Acceptance Criteria**

* Toggle dark/light mode, persist di localStorage.
* Semua komponen respect theme variables.

---

## Advanced Data Export (PDF)

**Checklist**

* [ ] **4.5.1 Install jsPDF**

  ```bash
  bun add jspdf jspdf-autotable
  bun add -D @types/jspdf
  ```

* [ ] **4.5.2 PDF Service — `src/services/export.ts` (update)**

  ```ts
  import jsPDF from 'jspdf';
  import 'jspdf-autotable';

  export async function generateTransactionPDF(userId: number, filters: any) {
    const transactions = await getFilteredTransactions(userId, filters);
    
    const doc = new jsPDF();
    doc.text('Laporan Transaksi KANTONG', 20, 20);
    
    const tableData = transactions.map(t => [t.date, t.description, t.amount]);
    (doc as any).autoTable({
      head: [['Tanggal', 'Deskripsi', 'Jumlah']],
      body: tableData,
      startY: 30
    });
    
    return doc.output('blob');
  }
  ```

* [ ] **4.5.3 API Route — `src/app/api/export/pdf/route.ts`**

  ```ts
  import { NextResponse } from 'next/server';
  import { generateTransactionPDF } from '@/services/export';

  export async function GET(req: Request) {
    // Auth check, parse filters
    const pdfBlob = await generateTransactionPDF(userId, filters);
    
    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="kantong-report.pdf"'
      }
    });
  }
  ```

* [ ] **4.5.4 UI — Update Export Button**

  Tambah opsi "Export PDF" di halaman laporan.

**Acceptance Criteria**

* Tombol "Export PDF" menghasilkan file PDF dengan tabel transaksi.

---

## Advanced Search & Filtering

**Checklist**

* [ ] **4.6.1 Search Schema — `src/lib/validations/search.ts`**

  ```ts
  import { z } from 'zod';

  export const SearchFiltersSchema = z.object({
    query: z.string().optional(),
    categoryId: z.number().optional(),
    accountId: z.number().optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    amountMin: z.number().optional(),
    amountMax: z.number().optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional()
  });
  ```

* [ ] **4.6.2 Service — `src/services/transaction.ts` (update `getTransactions`)**

  ```ts
  export async function getFilteredTransactions(userId: number, filters: z.infer<typeof SearchFiltersSchema>) {
    let query = db.select().from(transactions).where(eq(transactions.userId, userId));
    
    if (filters.query) {
      query = query.where(like(transactions.description, `%${filters.query}%`));
    }
    if (filters.categoryId) {
      query = query.where(eq(transactions.categoryId, filters.categoryId));
    }
    // Tambah filter lainnya...
    
    return query;
  }
  ```

* [ ] **4.6.3 UI — `AdvancedSearchForm.tsx`**

  Form dengan input text, dropdown kategori/akun, date pickers, amount range.

* [ ] **4.6.4 Integration — Update Transaction List**

  Pakai `useQuery` dengan filters, debounce search input.

**Acceptance Criteria**

* Search by description, filter by kategori/akun/tanggal/jumlah/type.
* Real-time results dengan debounce.

---

## Notification System

**Checklist**

* [ ] **4.7.1 Skema Notification**

  ```ts
  // schema.ts
  export const notifications = pgTable('notifications', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    type: pgEnum('notification_type', ['BUDGET_ALERT', 'GOAL_REMINDER', 'TRANSACTION_ALERT'])('type').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  });
  ```

* [ ] **4.7.2 Service — `src/services/notification.ts`**

  ```ts
  export async function createNotification(userId: number, type: string, title: string, message: string) {
    return db.insert(notifications).values({ userId, type, title, message });
  }

  export async function getUnreadNotifications(userId: number) {
    return db.select().from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }
  ```

* [ ] **4.7.3 Trigger Logic**

  * Di `createTransaction`: jika expense > budget limit, buat notification.
  * Di `updateGoal`: jika mendekati deadline, reminder.

* [ ] **4.7.4 UI — `NotificationBell.tsx`**

  Icon bell dengan badge count unread, dropdown list notifications.

* [ ] **4.7.5 Push Notifications (Optional)**

  Integrasi dengan Web Push API untuk browser notifications.

**Acceptance Criteria**

* Notifications untuk budget alerts & goal reminders.
* UI bell icon dengan dropdown, mark as read.

---

## Offline Support

**Checklist**

* [ ] **4.8.1 Service Worker Enhancement — `public/sw.js`**

  ```js
  // Cache static assets, API responses untuk read-only data
  const CACHE_NAME = 'kantong-v1';

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll([
          '/',
          '/manifest.json',
          // static assets
        ]);
      })
    );
  });

  self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/api/')) {
      // Cache read-only APIs
      event.respondWith(
        caches.match(event.request).then((response) => {
          return response || fetch(event.request);
        })
      );
    }
  });
  ```

* [ ] **4.8.2 Offline UI — `src/components/OfflineIndicator.tsx`**

  ```tsx
  'use client';
  import { useState, useEffect } from 'react';

  export default function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }, []);

    if (isOnline) return null;

    return (
      <div className="fixed bottom-4 right-4 bg-yellow-500 text-white p-2 rounded">
        Offline - Beberapa fitur terbatas
      </div>
    );
  }
  ```

* [ ] **4.8.3 Data Sync — `src/services/sync.ts`**

  ```ts
  export async function syncPendingTransactions() {
    // Ambil pending dari IndexedDB/localStorage, sync ke server saat online
  }
  ```

* [ ] **4.8.4 IndexedDB untuk Local Storage**

  Gunakan `idb` library untuk store data lokal saat offline.

**Acceptance Criteria**

* App berfungsi offline untuk view data cached.
* Indicator offline, sync otomatis saat kembali online.