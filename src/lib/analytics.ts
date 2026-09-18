import {
  Transaction,
  Category,
  AnomalyAlert,
  BudgetBurnRate,
  CashFlowMonth,
  CategoryBreakdown,
  RecurringSubscription,
  TimeSeriesForecastPoint,
} from '@/types/finance';
import { DEFAULT_CATEGORIES } from './constants';

/**
 * Computes statistical metrics (mean & standard deviation) and detects anomalies.
 * Formula: Anomaly flagged if amount > (mean + 2 * std_dev) for category with N >= 3
 */
export function detectAnomalies(
  transactions: Transaction[],
  categories: Category[] = DEFAULT_CATEGORIES
): { transactions: Transaction[]; alerts: AnomalyAlert[] } {
  const alerts: AnomalyAlert[] = [];
  
  // Group expense amounts by category
  const categoryStats: Record<
    string,
    { amounts: number[]; total: number; mean: number; stdDev: number; threshold: number }
  > = {};

  for (const t of transactions) {
    if (t.type === 'expense' && t.category !== 'Income & Salary') {
      if (!categoryStats[t.category]) {
        categoryStats[t.category] = { amounts: [], total: 0, mean: 0, stdDev: 0, threshold: 0 };
      }
      categoryStats[t.category].amounts.push(t.amount);
      categoryStats[t.category].total += t.amount;
    }
  }

  // Calculate Mean (μ) and Standard Deviation (σ)
  for (const cat in categoryStats) {
    const stats = categoryStats[cat];
    const n = stats.amounts.length;
    if (n >= 3) {
      stats.mean = stats.total / n;
      const variance =
        stats.amounts.reduce((sum, val) => sum + Math.pow(val - stats.mean, 2), 0) / n;
      stats.stdDev = Math.sqrt(variance);
      // Statistical threshold: μ + 2σ
      stats.threshold = stats.mean + 2 * stats.stdDev;
    }
  }

  // Tag transactions and generate anomaly alerts
  const updatedTransactions = transactions.map((t) => {
    if (t.type !== 'expense') return t;

    const stats = categoryStats[t.category];
    if (stats && stats.amounts.length >= 3 && t.amount > stats.threshold && t.amount > 40) {
      const confidence = Math.min(
        0.99,
        0.75 + ((t.amount - stats.threshold) / (stats.threshold || 1)) * 0.2
      );
      const reason = `Exceeds baseline threshold of $${stats.threshold.toFixed(
        2
      )} (Category mean: $${stats.mean.toFixed(2)}, 2σ: $${(2 * stats.stdDev).toFixed(2)})`;

      alerts.push({
        id: `alert-${t.id}`,
        transactionId: t.id,
        merchant: t.cleanMerchant,
        category: t.category,
        amount: t.amount,
        categoryMean: stats.mean,
        categoryStdDev: stats.stdDev,
        threshold: stats.threshold,
        date: t.date,
        status: 'unread',
      });

      return {
        ...t,
        isAnomaly: true,
        anomalyConfidence: Number(confidence.toFixed(2)),
        anomalyReason: reason,
      };
    }

    return { ...t, isAnomaly: false };
  });

  return { transactions: updatedTransactions, alerts };
}

/**
 * Calculates Category Breakdown totals, percentages, and counts
 */
export function calculateCategoryBreakdowns(
  transactions: Transaction[],
  categories: Category[] = DEFAULT_CATEGORIES
): CategoryBreakdown[] {
  const expenseMap = new Map<string, { total: number; count: number }>();
  let grandTotal = 0;

  for (const t of transactions) {
    if (t.type === 'expense' && t.category !== 'Income & Salary') {
      const current = expenseMap.get(t.category) || { total: 0, count: 0 };
      current.total += t.amount;
      current.count += 1;
      expenseMap.set(t.category, current);
      grandTotal += t.amount;
    }
  }

  const categoryLookup = new Map(categories.map((c) => [c.name, c]));

  const result: CategoryBreakdown[] = [];
  expenseMap.forEach((val, categoryName) => {
    const meta = categoryLookup.get(categoryName) || {
      color: '#94a3b8',
      icon: 'Tag',
      monthlyBudget: 0,
    };
    result.push({
      category: categoryName,
      color: meta.color,
      icon: meta.icon,
      total: Math.round(val.total * 100) / 100,
      percentage: grandTotal > 0 ? Math.round((val.total / grandTotal) * 1000) / 10 : 0,
      transactionCount: val.count,
      monthlyBudget: meta.monthlyBudget,
    });
  });

  return result.sort((a, b) => b.total - a.total);
}

/**
 * Calculates Monthly Cash Flow (Inflow vs Outflow & Savings Rate)
 */
export function calculateCashFlowTrends(transactions: Transaction[]): CashFlowMonth[] {
  const monthMap = new Map<string, { income: number; expense: number }>();

  for (const t of transactions) {
    const monthKey = t.date.slice(0, 7); // 'YYYY-MM'
    const current = monthMap.get(monthKey) || { income: 0, expense: 0 };

    if (t.type === 'income' || t.category === 'Income & Salary') {
      current.income += t.amount;
    } else {
      current.expense += t.amount;
    }
    monthMap.set(monthKey, current);
  }

  const sortedMonths = Array.from(monthMap.keys()).sort();

  return sortedMonths.map((m) => {
    const data = monthMap.get(m)!;
    const [year, monthNum] = m.split('-');
    const dateObj = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const monthLabel = dateObj.toLocaleString('default', { month: 'short', year: 'numeric' });
    const netSavings = data.income - data.expense;
    const savingsRate = data.income > 0 ? Math.max(0, Math.round((netSavings / data.income) * 100)) : 0;

    return {
      month: m,
      monthLabel,
      income: Math.round(data.income),
      expense: Math.round(data.expense),
      netSavings: Math.round(netSavings),
      savingsRate,
    };
  });
}

/**
 * Computes Budget Burn-Rate and End-of-Month Projections:
 * Formula: daily burn rate d = Current Spent / Days Elapsed
 * Projected = d * Total Days
 */
export function calculateBudgetBurnRates(
  transactions: Transaction[],
  categories: Category[] = DEFAULT_CATEGORIES,
  referenceDate: Date = new Date()
): BudgetBurnRate[] {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth(); // 0-indexed
  const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysElapsed = Math.min(totalDays, Math.max(1, referenceDate.getDate()));

  // Sum spending for current month per category
  const currentSpendMap = new Map<string, number>();
  for (const t of transactions) {
    if (t.type === 'expense' && t.date.startsWith(currentMonthStr)) {
      currentSpendMap.set(t.category, (currentSpendMap.get(t.category) || 0) + t.amount);
    }
  }

  const burnRates: BudgetBurnRate[] = [];

  for (const cat of categories) {
    if (!cat.monthlyBudget || cat.monthlyBudget <= 0 || cat.name === 'Income & Salary') continue;

    const spent = currentSpendMap.get(cat.name) || 0;
    const dailyRate = spent / daysElapsed;
    const projectedTotal = Math.round(dailyRate * totalDays);
    const projectedOverrun = Math.max(0, projectedTotal - cat.monthlyBudget);
    const percentSpent = Math.round((spent / cat.monthlyBudget) * 100);
    const projectedPercent = Math.round((projectedTotal / cat.monthlyBudget) * 100);

    burnRates.push({
      categoryId: cat.id,
      categoryName: cat.name,
      color: cat.color,
      monthlyLimit: cat.monthlyBudget,
      currentSpent: Math.round(spent),
      daysElapsed,
      totalDays,
      dailyBurnRate: Math.round(dailyRate * 10) / 10,
      projectedTotal,
      projectedOverrun,
      percentSpent,
      projectedPercent,
      isOverBudgetRisk: projectedTotal > cat.monthlyBudget,
    });
  }

  return burnRates.sort((a, b) => b.projectedPercent - a.projectedPercent);
}

/**
 * Double Exponential Smoothing (Holt's Linear Model) for Time-Series Spending Forecast
 * Computes level Lt and trend Tt on historical spending to project upcoming periods.
 */
export function calculateTimeSeriesForecast(
  cashflow: CashFlowMonth[],
  forecastSteps: number = 3
): TimeSeriesForecastPoint[] {
  if (!cashflow || cashflow.length === 0) return [];

  const points: TimeSeriesForecastPoint[] = [];

  // Historical points
  cashflow.forEach((cf) => {
    points.push({
      date: cf.month,
      label: cf.monthLabel,
      actual: cf.expense,
      forecast: cf.expense,
      lowerBound: cf.expense,
      upperBound: cf.expense,
      isProjected: false,
    });
  });

  if (cashflow.length < 2) {
    // If not enough data for Holt's model, generate simple average continuation
    const baseline = cashflow[0]?.expense || 2000;
    for (let i = 1; i <= forecastSteps; i++) {
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + i);
      const label = nextDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      points.push({
        date: `proj-${i}`,
        label,
        forecast: baseline,
        lowerBound: Math.round(baseline * 0.85),
        upperBound: Math.round(baseline * 1.15),
        isProjected: true,
      });
    }
    return points;
  }

  // Holt's Linear Exponential Smoothing parameters
  const alpha = 0.4; // Smoothing factor for the level
  const beta = 0.3;  // Smoothing factor for the trend

  let level = cashflow[0].expense;
  let trend = cashflow[1].expense - cashflow[0].expense;

  for (let t = 1; t < cashflow.length; t++) {
    const y = cashflow[t].expense;
    const prevLevel = level;
    level = alpha * y + (1 - alpha) * (prevLevel + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  // Project future steps
  const lastMonthKey = cashflow[cashflow.length - 1].month;
  const [yStr, mStr] = lastMonthKey.split('-');
  const baseDate = new Date(parseInt(yStr), parseInt(mStr) - 1, 1);

  for (let h = 1; h <= forecastSteps; h++) {
    const projectedDate = new Date(baseDate);
    projectedDate.setMonth(projectedDate.getMonth() + h);
    const monthKey = `${projectedDate.getFullYear()}-${String(
      projectedDate.getMonth() + 1
    ).padStart(2, '0')}`;
    const label = projectedDate.toLocaleString('default', { month: 'short', year: 'numeric' });

    // Holt's forecast formula: Y_hat(t+h) = Level + h * Trend
    const forecastedValue = Math.max(100, Math.round(level + h * trend));
    const uncertaintyFactor = 0.08 * h; // bounds widen further in future

    points.push({
      date: monthKey,
      label: `${label} (Proj)`,
      forecast: forecastedValue,
      lowerBound: Math.round(forecastedValue * (1 - uncertaintyFactor)),
      upperBound: Math.round(forecastedValue * (1 + uncertaintyFactor)),
      isProjected: true,
    });
  }

  return points;
}

/**
 * Detects Recurring Subscriptions and Periodic Bills
 * Analyzes transaction merchant frequencies, cadence intervals, and amounts.
 */
export function detectRecurringSubscriptions(
  transactions: Transaction[]
): RecurringSubscription[] {
  const merchantGroups = new Map<string, Transaction[]>();

  for (const t of transactions) {
    if (t.type === 'expense') {
      const key = t.cleanMerchant.toLowerCase();
      const list = merchantGroups.get(key) || [];
      list.push(t);
      merchantGroups.set(key, list);
    }
  }

  const subscriptions: RecurringSubscription[] = [];

  merchantGroups.forEach((items, merchantKey) => {
    if (items.length < 2) return;

    // Sort by date ascending
    items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Check amount consistency (std deviation or max difference <= 15%)
    const amounts = items.map((i) => i.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const isAmountConsistent = amounts.every(
      (a) => Math.abs(a - avgAmount) / (avgAmount || 1) <= 0.20
    );

    if (!isAmountConsistent) return;

    // Calculate day intervals between sequential charges
    const intervals: number[] = [];
    for (let i = 1; i < items.length; i++) {
      const diffDays = Math.round(
        (new Date(items[i].date).getTime() - new Date(items[i - 1].date).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      intervals.push(diffDays);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    let cadence: 'weekly' | 'biweekly' | 'monthly' | 'yearly' | null = null;
    let confidence = 0.85;

    if (avgInterval >= 5 && avgInterval <= 9) {
      cadence = 'weekly';
      confidence = 0.95;
    } else if (avgInterval >= 12 && avgInterval <= 16) {
      cadence = 'biweekly';
      confidence = 0.90;
    } else if (avgInterval >= 25 && avgInterval <= 35) {
      cadence = 'monthly';
      confidence = 0.96;
    } else if (avgInterval >= 340 && avgInterval <= 390) {
      cadence = 'yearly';
      confidence = 0.88;
    }

    if (cadence) {
      const lastTx = items[items.length - 1];
      const lastDate = new Date(lastTx.date);
      const nextDate = new Date(lastDate);

      if (cadence === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
      else if (cadence === 'biweekly') nextDate.setDate(nextDate.getDate() + 14);
      else if (cadence === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      else if (cadence === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

      subscriptions.push({
        merchant: lastTx.cleanMerchant,
        category: lastTx.category,
        averageAmount: Math.round(avgAmount * 100) / 100,
        cadence,
        lastBilledDate: lastTx.date,
        nextProjectedDate: nextDate.toISOString().slice(0, 10),
        confidenceScore: confidence,
        transactionCount: items.length,
      });
    }
  });

  return subscriptions.sort((a, b) => b.averageAmount - a.averageAmount);
}
