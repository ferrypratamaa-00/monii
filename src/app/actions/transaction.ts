'use server';

import { z } from 'zod';
import { TransactionSchema } from '@/lib/validations/transaction';
import { createTransaction } from '@/services/transaction';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function createTransactionAction(formData: FormData) {
  // Auth check
  const c = await cookies();
  const token = c.get('session')?.value;
  if (!token) {
    return { success: false, error: 'Unauthorized' };
  }

  let userId: number;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    userId = decoded.userId;
  } catch {
    return { success: false, error: 'Invalid session' };
  }

  // Parse form data
  const data = {
    accountId: parseInt(formData.get('accountId') as string),
    categoryId: formData.get('categoryId') ? parseInt(formData.get('categoryId') as string) : undefined,
    type: formData.get('type') as 'INCOME' | 'EXPENSE',
    amount: parseFloat(formData.get('amount') as string),
    description: formData.get('description') as string || undefined,
    date: new Date(formData.get('date') as string),
    isRecurring: formData.get('isRecurring') === 'true',
  };

  const result = TransactionSchema.safeParse(data);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    const trx = await createTransaction({ ...result.data, userId });
    return { success: true, transaction: trx };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}