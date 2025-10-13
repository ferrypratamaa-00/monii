# KANTONG — PRD + Rencana Pengembangan Super Rinci

## 0) Meta

* [ ] Repo Git siap (GitHub/GitLab) + proteksi branch `main` (PR wajib, review minimal 1).
* [ ] CI minimal: **Build + Typecheck + Lint + Unit test** (GitHub Actions).
* [ ] `.env.example` lengkap (tanpa nilai rahasia).
* [ ] Dokumentasi `README.md` + `CONTRIBUTING.md`.
* [ ] Color Pallete : E7F2EF, A1C2BD, 708993, 1B3C53
* [ ] Style simple, clean Design, modern rounded based
* [ ] Mmobile First, Responsive

---

# Fase 0 — Inisiasi & Infrastruktur (PWA, Linting, DB)

## 0.1 Bootstrap Proyek & Kualitas Kode

* [ ] **Langkah 0.1.1 — Inisiasi Next.js (App Router, TS, Tailwind, ESLint)**

  ```bash
  bun create next-app@latest kantong-app -- --ts --tailwind --eslint
  cd kantong-app
  ```

  **DoD:** Proyek jalan `bun run dev`, halaman starter tampil.

* [ ] **Langkah 0.1.2 — Git init & commit awal**

  ```bash
  git init
  git add .
  git commit -m "chore: initial nextjs project setup"
  git branch -M main
  # git remote add origin <git-remote-url>
  # git push -u origin main
  ```

* [ ] **Langkah 0.1.3 — Biome (formatter + linter all-in-one)**

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

* [ ] **Langkah 0.1.4 — Husky + lint-staged (pre-commit)**

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

* [ ] **Langkah 0.2.1 — Install PWA**

  ```bash
  bun add next-pwa
  ```
* [ ] **Langkah 0.2.2 — next.config.mjs**

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
* [ ] **Langkah 0.2.3 — Manifest & ikon**

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
* [ ] **Langkah 0.2.4 — Inject manifest di layout**

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

* [ ] **Langkah 0.3.1 — Install lib data**

  ```bash
  bun add drizzle-orm zod @tanstack/react-query @tanstack/react-query-next-experimental
  bun add -D drizzle-kit typescript ts-node
  ```

* [ ] **Langkah 0.3.2 — Drizzle config**

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

* [ ] **Langkah 0.3.3 — Struktur DB & koneksi**

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

* [ ] **Langkah 0.3.4 — Skema dasar (User, Account, Category, Transaction, Debt)**

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

* [ ] **Langkah 0.3.5 — shadcn/ui**

  ```bash
  bunx shadcn-ui@latest init
  bunx shadcn-ui@latest add button input form dialog toast separator card progress badge
  ```

  **DoD:** Komponen UI dasar tersedia.

* [ ] **Langkah 0.3.6 — TanStack Query Provider**

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

* [ ] **Langkah 0.3.7 — Commit Infrastruktur**

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

* [ ] **1.1.1 Validasi (Zod) — `src/lib/validations/auth.ts`**

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

* [ ] **1.1.2 Service — `src/services/auth.ts`**

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

* [ ] **1.1.3 Actions — `src/app/actions/auth.ts`**

  * `signUpAction(formData)` → parse Zod → `authService.registerUser` → set cookie sesi.
  * `loginAction(formData)` → parse Zod → `authService.verifyCredentials` → set cookie sesi.
  * Error mapping: `ZodError` → field errors; lainnya → toast generic.

* [ ] **1.1.4 Komponen — `LoginForm.tsx` & `SignUpForm.tsx`**

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

* [ ] **1.2.1 Validasi — `src/lib/validations/transaction.ts`**

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

* [ ] **1.2.2 Service (KRITIS Atomic) — `src/services/transaction.ts`**

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

* [ ] **1.2.3 Action — `src/app/actions/transaction.ts`**

  * `createTransactionAction(formData)` → parse Zod → `service.createTransaction`.

* [ ] **1.2.4 UI — `TransactionForm.tsx`, `TransactionModal.tsx`**

  * Reusable form (DRY), pilih akun, kategori, tipe, tanggal.
  * `useMutation` + invalidasi query daftar transaksi & saldo akun.

**Acceptance Criteria**

* Transaksi tersimpan & saldo akun berubah **atomically**.
* UX halus (loading state, error toast).
* Tes: rollback bila salah satu langkah gagal.

---

## M-3.0 — Kategori & Akun Dompet

**Checklist**

* [ ] **1.3.1 Services — `account.ts`, `category.ts`**
  CRUD sederhana (create/get/update/delete) ter-scoped ke `userId`.

* [ ] **1.3.2 FormWrapper — `src/components/forms/FormWrapper.tsx`**

  * Menerima `zodSchema`, `defaultValues`, `onSubmit`, render prop children.
  * Tangani error & loading generik.

* [ ] **1.3.3 UI Akun — `AccountList.tsx`, `AccountForm.tsx`**

  * List akun + modal tambah/edit.
  * Tampilkan saldo saat ini & saldo awal.

* [ ] **1.3.4 UI Kategori — `CategoryManager.tsx`, `CategoryForm.tsx`**

  * CRUD kategori (type: INCOME/EXPENSE), icon picker simple.

**Acceptance Criteria**

* CRUD akun & kategori berjalan, validasi aman.
* Tidak ada duplikasi logika form (DRY via `FormWrapper`).

---

## M-4.0 — Laporan Sederhana & Utang Piutang

**Checklist**

* [ ] **1.4.1 Skema Debt (sudah di schema.ts)**

* [ ] **1.4.2 Dashboard Service — `src/services/dashboard.ts`**

  ```ts
  export async function getTotalBalance(userId: number) { /* SUM balance semua akun */ }
  export async function getMonthlySummary(userId: number) {
    // SUM(amount) income & expense untuk bulan berjalan (date_trunc('month', date))
  }
  ```

* [ ] **1.4.3 Debt Service — `src/services/debt.ts`**

  * CRUD + `markAsPaid(debtId)` (ubah status + optional transaksi balancing jika diinginkan)

* [ ] **1.4.4 Halaman Dashboard**

  * `src/app/(protected)/dashboard/page.tsx`
  * Kartu ringkasan saldo & pie pengeluaran bulan berjalan.

* [ ] **1.4.5 Visualisasi — `PieChart.tsx`**

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

* [ ] **2.1.1 Skema Budget**

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

* [ ] **2.1.2 Service — `budget.ts`**
  CRUD + `updateBudgetSpending(categoryId, amount)`.

* [ ] **2.1.3 Integrasi Kritis — modify `createTransaction`**
  Setelah update balance, panggil:

  ```ts
  if (input.type === 'EXPENSE' && input.categoryId) {
    await budgetService.updateBudgetSpending(input.categoryId, Math.abs(input.amount));
  }
  ```

* [ ] **2.1.4 UI — `BudgetProgressBar.tsx`**

  * Warna dinamis: <60% hijau, 60-80% kuning, >80% merah.
  * Tooltip sisa anggaran & estimasi hari.

**Acceptance Criteria**

* Budget otomatis ter-update saat transaksi expense dibuat.
* Peringatan muncul saat >80%.

---

## M-6.0 — Laporan Lanjutan (Tren) & Ekspor Data

**Checklist**

* [ ] **2.2.1 Dashboard Service — `getMonthlyTrendData(userId, numMonths)`**

  * Agregasi per bulan (`date_trunc` / raw SQL) untuk 12 bulan terakhir.

* [ ] **2.2.2 Ekspor Service — `src/services/export.ts`**

  * `generateTransactionCSV(userId, filter)` → string CSV.
  * **lib/csv/stringify.ts**: util sederhana (hindari dep besar jika bisa).

* [ ] **2.2.3 API Ekspor — `src/app/api/export/route.ts`**

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

* [ ] **2.2.4 Visualisasi — `LineChart.tsx`**

  * Bandingkan income vs expense 12 bulan.

**Acceptance Criteria**

* Grafik tren 12 bulan tampil.
* Tombol “Ekspor CSV” mengunduh file dengan filter.

---

## M-7.0 — Sinkronisasi Cloud & Keamanan Lanjutan

**Checklist**

* [ ] **2.3.1 ErrorBoundary (frontend)**

  * Komponen `ErrorBoundary` + `fallback UI` di layout protected.

* [ ] **2.3.2 Password Reset Flow (Service Layer)**

  * Tabel `password_resets` (token, userId, expiresAt, usedAt).
  * Generate token kriptografis, kirim email via **Postmark/SendGrid**.
  * Endpoint/action untuk verifikasi & set password baru.

* [ ] **2.3.3 Backup Service — `createFullDataBackup(userId)`**

  * Dump semua entitas pengguna → objek JSON siap unduh.

* [ ] **2.3.4 UI — Tombol “Unduh Backup Data”**

  * Server Action mengembalikan file JSON.

**Acceptance Criteria**

* Reset password berfungsi (email diterima, token valid/expired ditangani).
* Backup JSON terunduh lengkap.

---

# Fase 3 — Diferensiasi (M-8.0 s/d M-10.0)

## M-8.0 — Analisis Cerdas (AI-Driven)

**Checklist**

* [ ] **3.1.1 AI Service — `src/services/ai.ts`**

  * **Ambil agregat**: top 3 kategori, rata-rata pengeluaran harian, spike outlier.
  * Hindari kirim raw transaksi (hemat token/biaya).

* [ ] **3.1.2 Prompt Engineering (Gemini)**

  ```
  System: "Anda adalah Penasihat Finansial KANTUNG. Berikan 3 saran spesifik, bernada suportif, berbasis data agregat."
  User: {json data agregat 90 hari}
  ```

* [ ] **3.1.3 Panggilan API Gemini**

  * `GEMINI_API_KEY` via env, panggil SDK/REST dari server.
  * Sanitasi input, timeout, retry.

* [ ] **3.1.4 UI — `AISuggestionCard.tsx`**

  * Skeleton loader, error state yang ramah.
  * **Menampilkan hasil saran AI** ke pengguna.

**Acceptance Criteria**

* Halaman “Wawasan Cerdas” menampilkan 3 tips actionable berbasis data user.

---

## M-9.0 — Gamifikasi & Tujuan Bersama

**Checklist**

* [ ] **3.2.1 Skema Goal + Member + Badge**

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

* [ ] **3.2.2 Services — goal.ts**

  * `createJointGoal(data, members)`
  * `contributeToGoal(goalId, amount)` (atomic: kurangi saldo akun contributor, tambah savedAmount goal).

* [ ] **3.2.3 Badge logic**

  * Rule engine sederhana (mis. sukses 3 bulan berturut-turut di bawah budget).

* [ ] **3.2.4 UI**

  * `GoalProgressCard.tsx` + `BadgeDisplay.tsx`.

**Acceptance Criteria**

* Tujuan bersama dapat dibuat, member ditambahkan, kontribusi tercatat atomically.
* Badge muncul saat rule terpenuhi.

---

## M-10.0 — Otomatisasi (Scan Struk/OCR)

**Checklist**

* [ ] **3.3.1 OCR Service — `src/services/ocr.ts`**

  * `processReceiptImage(file)` → base64 → kirim ke Vision/OCR API → normalisasi output `{vendor, amount, date}`.

* [ ] **3.3.2 Frontend Capture — `CameraCaptureModal.tsx`**

  * Akses kamera/upload, preview, kirim ke server action.

* [ ] **3.3.3 Review Screen (KRITIS) — `ReviewTransactionModal.tsx`**

  * Menampilkan gambar & hasil OCR (editable): vendor, jumlah, tanggal, saran kategori.
  * **Wajib:** user mengonfirmasi/ubah sebelum `createTransactionAction`.

* [ ] **3.3.4 Update Action — `createTransactionAction`**

  * Menerima data dari review, normalisasi, lanjut ke service atomic.

**Acceptance Criteria**

* Alur: ambil foto → OCR → review & koreksi → simpan transaksi berjalan mulus.

---

# Panduan Keamanan (Security Playbook)

**Konfigurasi & Secret**

* [ ] `.env` hanya dibaca server. Commit **hanya** `.env.example`.
* [ ] Rotasi kunci API (Gemini/OCR/Email) berkala, beri scope minimal.

**Autentikasi & Sesi**

* [ ] Cookie **HttpOnly**, `Secure`, `SameSite=Lax/Strict`. Simpan minimal claims (userId, iat, exp).
* [ ] Hash password **bcrypt** dengan cost 12 (atau **argon2id** jika memungkinkan).
* [ ] Rate limiting brute-force login (IP + account), exponential backoff.
* [ ] **2FA (TOTP)** opsional di M-7.0.

**Autorisasi**

* [ ] Semua query service **mewajibkan userId** (multi-tenant boundary).
* [ ] Akses resource selalu `WHERE user_id = currentUserId`.

**Validasi & Sanitasi**

* [ ] **Zod** di boundaries (actions/API). Tolak input di luar skema.
* [ ] Hindari XSS: encode output, tidak inject HTML dari user.
* [ ] File upload: validasi MIME/ukuran, scan jika perlu, simpan privat.

**Transport & Headers**

* [ ] **HTTPS** wajib.
* [ ] Tambahkan security headers (via `next/headers` atau middleware):

  * `Content-Security-Policy` (default-src 'self'; img/media sesuai kebutuhan)
  * `X-Frame-Options: DENY`
  * `X-Content-Type-Options: nosniff`
  * `Referrer-Policy: strict-origin-when-cross-origin`
  * `Permissions-Policy` minimal

**PWA & SW**

* [ ] Service Worker tidak meng-cache response sensitif.
* [ ] Offline UI tidak membeberkan data user jika tidak ter-enkripsi lokal.

**DB & Transaksi**

* [ ] Semua operasi finansial **atomic** (Drizzle `db.transaction`).
* [ ] Gunakan **numeric(14,2)** untuk nilai uang; hindari float.

**Logging & Audit**

* [ ] Log kesalahan tanpa rahasia (PII/secret).
* [ ] Jejak audit untuk tindakan penting (ganti sandi, reset, ekspor, backup).

**Email & Reset**

* [ ] Token reset: acak kriptografis, sekali pakai, kadaluarsa (≤ 30 menit).
* [ ] Jangan leak apakah email terdaftar (pesan generik).

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

* [ ] Workflow: `on: [push, pull_request]`
* [ ] Steps: `setup-node`, `bun ci`, `bun run typecheck`, `bun run lint`, `bun run build`, jalankan unit tests.

**Testing (disarankan)**

* [ ] **Vitest** untuk unit/service

  ```bash
  bun add -D vitest @testing-library/react @testing-library/jest-dom
  ```
* [ ] **Playwright** untuk e2e PWA

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

* [ ] Next.js + TS + Tailwind + ESLint
* [ ] Biome + Husky + lint-staged
* [ ] PWA (manifest, SW, ikon)
* [ ] Drizzle (config + koneksi)
* [ ] shadcn/ui + TanStack Query
* [ ] Commit infra → merge

### Fase 1 — MVP

* [ ] **M-1.0 Auth** (Zod, service, actions, forms)
* [ ] **M-2.0 Transaksi** (Zod, atomic create, actions, UI)
* [ ] **M-3.0 Kategori & Akun** (CRUD + FormWrapper)
* [ ] **M-4.0 Dashboard & Debt** (summary, pie, debt CRUD)

### Fase 2 — Pengelolaan & Analisis

* [ ] **M-5.0 Budget** (skema, service, integrasi createTransaction, progress bar)
* [ ] **M-6.0 Tren & Ekspor** (trend query 12 bln, CSV API, line chart)
* [ ] **M-7.0 Security+Sync** (ErrorBoundary, reset password, backup JSON)

### Fase 3 — Diferensiasi

* [ ] **M-8.0 AI Insights** (agregat → Gemini → AISuggestionCard)
* [ ] **M-9.0 Goal & Badges** (joint goal atomic, badges)
* [ ] **M-10.0 OCR** (capture → OCR → review → transaksi)

---

## Catatan Implementasi Penting

* **State server vs client**: letakkan semua **mutasi** pada **Server Actions** → aman & konsisten; UI pakai **TanStack Query** untuk fetch dan cache.
* **Error UX**: gunakan `useToast` dari shadcn untuk pesan; fallback UI di error boundary.
* **A11y**: komponen form label-for, keyboard navigable; warna progress memperhatikan kontras.
* **I18n (opsional)**: strukturkan string agar mudah diterjemahkan (id default).
* **Performance**: gunakan **React Server Components** untuk data statis; `revalidate` untuk caching laporan; lazy-import chart.

---