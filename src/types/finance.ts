export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // positive number
  type: TransactionType;
  category: string;
  rawDescription: string;
  cleanMerchant: string;
  source: 'csv' | 'manual' | 'sample';
  account: string;
  isRecurring?: boolean;
  recurringCadence?: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  tags: string[];
  isAnomaly?: boolean;
  anomalyConfidence?: number;
  anomalyReason?: string;
  notes?: string;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  monthlyBudget?: number;
  isCustom?: boolean;
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  alertThreshold: number; // e.g. 0.8 for 80%
}

export interface CategorizationRule {
  id: string;
  pattern: string; // keyword or regex string
  targetCategory: string;
  cleanMerchantName: string;
  isRegex?: boolean;
  isUserCreated?: boolean;
  createdAt: string;
}

export interface AnomalyAlert {
  id: string;
  transactionId: string;
  merchant: string;
  category: string;
  amount: number;
  categoryMean: number;
  categoryStdDev: number;
  threshold: number; // mean + 2 * std_dev
  date: string;
  status: 'unread' | 'acknowledged' | 'dismissed';
}

export interface BudgetBurnRate {
  categoryId: string;
  categoryName: string;
  color: string;
  monthlyLimit: number;
  currentSpent: number;
  daysElapsed: number;
  totalDays: number;
  dailyBurnRate: number;
  projectedTotal: number;
  projectedOverrun: number;
  percentSpent: number;
  projectedPercent: number;
  isOverBudgetRisk: boolean;
}

export interface CashFlowMonth {
  month: string; // '2026-04'
  monthLabel: string; // 'Apr 2026'
  income: number;
  expense: number;
  netSavings: number;
  savingsRate: number; // percentage (0-100)
}

export interface CategoryBreakdown {
  category: string;
  color: string;
  icon: string;
  total: number;
  percentage: number;
  transactionCount: number;
  monthlyBudget?: number;
}

export interface RecurringSubscription {
  merchant: string;
  category: string;
  averageAmount: number;
  cadence: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  lastBilledDate: string;
  nextProjectedDate: string;
  confidenceScore: number;
  transactionCount: number;
}

export interface TimeSeriesForecastPoint {
  date: string; // 'YYYY-MM' or 'YYYY-MM-DD'
  label: string;
  actual?: number;
  forecast: number;
  lowerBound: number;
  upperBound: number;
  isProjected: boolean;
}
