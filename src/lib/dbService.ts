import { Transaction, Category, CategorizationRule } from '@/types/finance';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import {
  getStoredTransactions,
  saveStoredTransactions,
  getStoredCategories,
  saveStoredCategories,
  getStoredRules,
  saveStoredRules,
} from './storage';

export interface DbServiceResult<T> {
  data: T;
  source: 'supabase' | 'local';
  error?: string;
}

/**
 * Loads transactions from Supabase (if connected) or LocalStorage fallback
 */
export async function loadTransactions(): Promise<DbServiceResult<Transaction[]>> {
  const supabase = getSupabaseClient();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: Transaction[] = data.map((row: any) => ({
          id: row.id,
          date: row.date,
          amount: parseFloat(row.amount),
          type: row.type,
          category: row.category_id || 'Other Expenses',
          rawDescription: row.raw_description || '',
          cleanMerchant: row.clean_merchant,
          source: row.source || 'csv',
          account: row.account || 'Checking',
          isRecurring: row.is_recurring,
          recurringCadence: row.recurring_cadence,
          tags: [],
          isAnomaly: row.is_anomaly,
          createdAt: row.created_at,
        }));
        saveStoredTransactions(mapped);
        return { data: mapped, source: 'supabase' };
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage:', err);
    }
  }

  return { data: getStoredTransactions(), source: 'local' };
}

/**
 * Persists transactions to Supabase and local cache
 */
export async function persistTransactions(transactions: Transaction[]): Promise<void> {
  saveStoredTransactions(transactions);

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      const rows = transactions.map((t) => ({
        id: t.id,
        date: t.date,
        amount: t.amount,
        type: t.type,
        category_id: t.category,
        clean_merchant: t.cleanMerchant,
        raw_description: t.rawDescription,
        account: t.account,
        source: t.source,
        is_recurring: Boolean(t.isRecurring),
        recurring_cadence: t.recurringCadence,
        is_anomaly: Boolean(t.isAnomaly),
      }));

      await supabase.from('transactions').upsert(rows, { onConflict: 'id' });
    } catch (err) {
      console.error('Failed to sync transactions with Supabase', err);
    }
  }
}

/**
 * Pushes entire local dataset into connected Supabase database
 */
export async function pushAllToSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, count: 0, error: 'Supabase credentials not configured' };
  }

  try {
    const localTx = getStoredTransactions();
    const localCats = getStoredCategories();

    // 1. Upsert Categories
    const catRows = localCats.map((c) => ({
      id: c.name,
      name: c.name,
      color_code: c.color,
      icon: c.icon,
      monthly_budget: c.monthlyBudget || 0,
    }));
    await supabase.from('categories').upsert(catRows, { onConflict: 'id' });

    // 2. Upsert Transactions
    const txRows = localTx.map((t) => ({
      id: t.id,
      date: t.date,
      amount: t.amount,
      type: t.type,
      category_id: t.category,
      clean_merchant: t.cleanMerchant,
      raw_description: t.rawDescription,
      account: t.account,
      source: t.source,
      is_recurring: Boolean(t.isRecurring),
      recurring_cadence: t.recurringCadence,
      is_anomaly: Boolean(t.isAnomaly),
    }));

    const { error: txError } = await supabase
      .from('transactions')
      .upsert(txRows, { onConflict: 'id' });

    if (txError) {
      return { success: false, count: 0, error: txError.message };
    }

    return { success: true, count: localTx.length };
  } catch (err) {
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : 'Sync failed',
    };
  }
}
