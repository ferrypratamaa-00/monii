import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { budgets, categories, transactions } from "@/db/schema";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export async function generateTransactionCSV(
  userId: number,
  startDate?: Date,
  endDate?: Date,
) {
  const whereConditions = [eq(transactions.userId, userId)];

  if (startDate) {
    whereConditions.push(sql`${transactions.date} >= ${startDate}`);
  }

  if (endDate) {
    whereConditions.push(sql`${transactions.date} <= ${endDate}`);
  }

  const result = await db
    .select({
      date: transactions.date,
      type: transactions.type,
      amount: transactions.amount,
      description: transactions.description,
      category: categories.name,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(sql.join(whereConditions, sql` AND `))
    .orderBy(transactions.date);

  // Convert to CSV format
  const headers = ["Date", "Type", "Amount", "Description", "Category"];
  const csvRows = result.map((row) => [
    row.date.toISOString().split("T")[0],
    row.type,
    row.amount.toString(),
    `"${row.description}"`,
    row.category,
  ]);

  const csvContent = [headers, ...csvRows]
    .map((row) => row.join(","))
    .join("\n");

  return csvContent;
}

export async function generateTransactionPDF(
  userId: number,
  startDate?: Date,
  endDate?: Date,
) {
  const whereConditions = [eq(transactions.userId, userId)];

  if (startDate) {
    whereConditions.push(sql`${transactions.date} >= ${startDate}`);
  }

  if (endDate) {
    whereConditions.push(sql`${transactions.date} <= ${endDate}`);
  }

  const result = await db
    .select({
      date: transactions.date,
      type: transactions.type,
      amount: transactions.amount,
      description: transactions.description,
      category: categories.name,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(sql.join(whereConditions, sql` AND `))
    .orderBy(transactions.date);

  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text('Laporan Transaksi KANTONG', 20, 20);

  // Date range
  doc.setFontSize(12);
  const dateRange = startDate && endDate
    ? `Periode: ${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}`
    : 'Semua Periode';
  doc.text(dateRange, 20, 35);

  // Table data
  const tableData = result.map((row) => [
    row.date.toLocaleDateString('id-ID'),
    row.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran',
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(row.amount)),
    row.description || '-',
    row.category,
  ]);

  (doc as any).autoTable({
    head: [['Tanggal', 'Tipe', 'Jumlah', 'Deskripsi', 'Kategori']],
    body: tableData,
    startY: 45,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  return doc.output('blob');
}

export async function generateBudgetCSV(userId: number) {
  const result = await db
    .select({
      category: categories.name,
      period: budgets.period,
      limitAmount: budgets.limitAmount,
      currentSpending: budgets.currentSpending,
      remaining: sql<number>`${budgets.limitAmount} - ${budgets.currentSpending}`,
    })
    .from(budgets)
    .innerJoin(categories, eq(budgets.categoryId, categories.id))
    .where(eq(budgets.userId, userId));

  const headers = [
    "Category",
    "Period",
    "Limit Amount",
    "Current Spending",
    "Remaining",
  ];
  const csvRows = result.map((row) => [
    row.category,
    row.period,
    row.limitAmount.toString(),
    row.currentSpending.toString(),
    row.remaining.toString(),
  ]);

  const csvContent = [headers, ...csvRows]
    .map((row) => row.join(","))
    .join("\n");

  return csvContent;
}
