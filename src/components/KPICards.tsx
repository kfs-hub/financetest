'use client';

import React from 'react';
import { DollarSign, Wallet, PiggyBank, Flame, ArrowUpRight, AlertTriangle, IndianRupee } from 'lucide-react';
import { CashFlowMonth, BudgetBurnRate } from '@/types/finance';
import { CurrencyCode, formatCurrency } from '@/lib/currency';

interface KPICardsProps {
  currentCashflow?: CashFlowMonth;
  previousCashflow?: CashFlowMonth;
  burnRates: BudgetBurnRate[];
  totalBudget: number;
  currency: CurrencyCode;
}

export const KPICards: React.FC<KPICardsProps> = ({
  currentCashflow,
  previousCashflow,
  burnRates,
  totalBudget,
  currency,
}) => {
  const income = currentCashflow?.income || 0;
  const expense = currentCashflow?.expense || 0;
  const netSavings = currentCashflow?.netSavings || 0;
  const savingsRate = currentCashflow?.savingsRate || 0;

  const now = new Date();
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysElapsed = Math.min(totalDaysInMonth, Math.max(1, now.getDate()));
  const dailyBurn = Math.round((expense / daysElapsed) * 10) / 10;
  const projectedMonthExpense = Math.round(dailyBurn * totalDaysInMonth);

  const budgetUsedPct = totalBudget > 0 ? Math.round((expense / totalBudget) * 100) : 0;
  const isOverBudget = projectedMonthExpense > totalBudget && totalBudget > 0;

  const IconCurrency = currency === 'INR' ? IndianRupee : DollarSign;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Monthly Cash Inflow */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl shadow-lg transition hover:border-emerald-500/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Monthly Inflow
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <IconCurrency className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-white">
            {formatCurrency(income, currency, { hideDecimals: true })}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              Active
            </span>
            <span>from salary / business credits</span>
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
      </div>

      {/* 2. Monthly Outflow vs Budget */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl shadow-lg transition hover:border-rose-500/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Monthly Outflow
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {formatCurrency(expense, currency, { hideDecimals: true })}
            </span>
            <span className="text-xs text-zinc-400">/ {formatCurrency(totalBudget, currency, { hideDecimals: true })}</span>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
              <span>Budget consumed</span>
              <span className={`font-semibold ${budgetUsedPct > 90 ? 'text-rose-400' : 'text-zinc-300'}`}>
                {budgetUsedPct}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetUsedPct > 100
                    ? 'bg-rose-500'
                    : budgetUsedPct > 80
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, budgetUsedPct)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Net Savings Rate */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl shadow-lg transition hover:border-cyan-500/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Net Savings Rate
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <PiggyBank className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {savingsRate}%
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              +{formatCurrency(netSavings, currency, { hideDecimals: true })} net
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
              {savingsRate >= 20 ? 'Optimal (>=20%)' : 'Caution (<20%)'}
            </span>
            <span>retained for wealth / SIPs</span>
          </div>
        </div>
      </div>

      {/* 4. Daily Spend Burn Rate */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl shadow-lg transition hover:border-amber-500/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Daily Burn Velocity
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {formatCurrency(dailyBurn, currency, { hideDecimals: true })}
            </span>
            <span className="text-xs text-zinc-400">/ day</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            {isOverBudget ? (
              <span className="flex items-center gap-1 font-semibold text-rose-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                Proj: {formatCurrency(projectedMonthExpense, currency, { hideDecimals: true })} (Overrun!)
              </span>
            ) : (
              <span className="text-zinc-400">
                Proj. Month-End: <strong className="text-zinc-200">{formatCurrency(projectedMonthExpense, currency, { hideDecimals: true })}</strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
