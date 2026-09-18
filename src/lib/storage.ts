import { Transaction, Category, CategorizationRule, AnomalyAlert } from '@/types/finance';
import { DEFAULT_CATEGORIES } from './constants';
import { generateSampleTransactions } from './sampleData';
import { detectAnomalies } from './analytics';

const STORAGE_KEYS = {
  TRANSACTIONS: 'pfa_transactions',
  CATEGORIES: 'pfa_categories',
  RULES: 'pfa_rules',
  ALERTS: 'pfa_alerts',
  INITIALIZED: 'pfa_initialized_v1',
};

export const SUPABASE_SQL_SCHEMA = `
-- =========================================================
-- Personal Finance Analyzer: Supabase PostgreSQL Schema
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color_code TEXT NOT NULL,
  icon TEXT,
  monthly_budget NUMERIC(10, 2) DEFAULT 0,
  is_custom BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Categorization Rules Table
CREATE TABLE IF NOT EXISTS categorization_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pattern TEXT NOT NULL,
  target_category TEXT NOT NULL,
  clean_merchant_name TEXT,
  is_regex BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  clean_merchant TEXT NOT NULL,
  raw_description TEXT,
  account TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('csv', 'manual', 'sync', 'sample')),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_cadence TEXT,
  is_anomaly BOOLEAN DEFAULT FALSE,
  anomaly_confidence NUMERIC(3, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  monthly_limit NUMERIC(10, 2) NOT NULL,
  alert_threshold NUMERIC(3, 2) DEFAULT 0.80,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorization_rules ENABLE ROW LEVEL SECURITY;
`;

export function getStoredTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      // Seed with sample data on first visit
      const samples = generateSampleTransactions();
      saveStoredTransactions(samples);
      return samples;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredTransactions(transactions: Transaction[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions to localStorage', err);
  }
}

export function getStoredCategories(): Category[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      saveStoredCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveStoredCategories(categories: Category[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories', err);
  }
}

export function getStoredRules(): CategorizationRule[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RULES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredRules(rules: CategorizationRule[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
  } catch (err) {
    console.error('Failed to save rules', err);
  }
}

export function resetToSampleData(): Transaction[] {
  if (typeof window === 'undefined') return [];
  const samples = generateSampleTransactions();
  saveStoredTransactions(samples);
  saveStoredCategories(DEFAULT_CATEGORIES);
  return samples;
}

export function exportBackupJson(): string {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    transactions: getStoredTransactions(),
    categories: getStoredCategories(),
    rules: getStoredRules(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJson(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.transactions && Array.isArray(parsed.transactions)) {
      const { transactions } = detectAnomalies(parsed.transactions);
      saveStoredTransactions(transactions);
      if (parsed.categories) saveStoredCategories(parsed.categories);
      if (parsed.rules) saveStoredRules(parsed.rules);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
