'use client';

import React from 'react';
import { Flame, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BudgetBurnRate } from '@/types/finance';
import { CurrencyCode, formatCurrency } from '@/lib/currency';

interface BurnRateWidgetProps {
  burnRates: BudgetBurnRate[];
  currency: CurrencyCode;
}

export const BurnRateWidget: React.FC<BurnRateWidgetProps> = ({ burnRates, currency }) => {
  if (!burnRates || burnRates.length === 0) {
    return null;
  }

  const daysElapsed = burnRates[0]?.daysElapsed || 1;
  const totalDays = burnRates[0]?.totalDays || 30;
  const monthProgressPct = Math.round((daysElapsed / totalDays) * 100);

  const highRiskCount = burnRates.filter((b) => b.isOverBudgetRisk).length;

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl shadow-lg">
      {/* Header & Month Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
              Budget Burn-Rate Velocity
            </h2>
            {highRiskCount > 0 && (
              <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                {highRiskCount} Overrun Risk
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400">
            Linear run-rate: <code className="text-emerald-400">Projected = (Spent / {daysElapsed} days) &times; {totalDays} days</code>
          </p>
        </div>

        {/* Month Day Progress Badge */}
        <div className="flex items-center gap-3 bg-zinc-950/60 px-3 py-1.5 rounded-xl border border-zinc-800 text-xs">
          <span className="text-zinc-400">
            Day <strong className="text-white">{daysElapsed}</strong> of {totalDays}
          </span>
          <div className="h-2 w-20 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full"
              style={{ width: `${monthProgressPct}%` }}
            />
          </div>
          <span className="text-cyan-400 font-semibold">{monthProgressPct}% elapsed</span>
        </div>
      </div>

      {/* Burn-rate Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {burnRates.slice(0, 6).map((rate) => {
          const isPacingFast = rate.projectedPercent > 100;
          return (
            <div
              key={rate.categoryId}
              className={`rounded-xl border p-3 text-xs transition ${
                isPacingFast
                  ? 'border-rose-500/30 bg-rose-950/10'
                  : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: rate.color }}
                  />
                  <span className="font-semibold text-white">{rate.categoryName}</span>
                </div>
                {isPacingFast ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400">
                    <AlertTriangle className="h-3 w-3" />
                    +{rate.projectedPercent - 100}% pace
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    On track
                  </span>
                )}
              </div>

              {/* Numbers */}
              <div className="mt-2.5 flex items-baseline justify-between">
                <div>
                  <span className="text-base font-extrabold text-white">
                    {formatCurrency(rate.currentSpent, currency, { hideDecimals: true })}
                  </span>
                  <span className="text-zinc-400 text-[11px]">
                    {' '}/ {formatCurrency(rate.monthlyLimit, currency, { hideDecimals: true })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-400 text-[11px]">Burn: </span>
                  <strong className="text-zinc-200">
                    {formatCurrency(rate.dailyBurnRate, currency, { hideDecimals: true })}/d
                  </strong>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    rate.percentSpent > 100
                      ? 'bg-rose-500'
                      : rate.percentSpent > 80
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, rate.percentSpent)}%` }}
                />
              </div>

              {/* Projected Footnote */}
              <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/60 pt-1.5">
                <span>Month-End Proj:</span>
                <span className={`font-semibold ${isPacingFast ? 'text-rose-400' : 'text-zinc-200'}`}>
                  {formatCurrency(rate.projectedTotal, currency, { hideDecimals: true })}{' '}
                  {isPacingFast && `(+${formatCurrency(rate.projectedOverrun, currency, { hideDecimals: true })})`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
