'use client';

import React, { useState } from 'react';
import {
  RefreshCw,
  Calendar,
  PiggyBank,
  CreditCard,
} from 'lucide-react';
import { RecurringSubscription } from '@/types/finance';
import { CurrencyCode, formatCurrency } from '@/lib/currency';

interface SubscriptionsViewProps {
  subscriptions: RecurringSubscription[];
  currency: CurrencyCode;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({ subscriptions, currency }) => {
  const [activeIds, setActiveIds] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    subscriptions.forEach((s) => {
      map[s.merchant] = true;
    });
    return map;
  });

  const toggleSub = (merchant: string) => {
    setActiveIds((prev) => ({ ...prev, [merchant]: !prev[merchant] }));
  };

  const monthlyTotal = subscriptions
    .filter((s) => activeIds[s.merchant] !== false)
    .reduce((sum, s) => {
      if (s.cadence === 'weekly') return sum + s.averageAmount * 4.33;
      if (s.cadence === 'biweekly') return sum + s.averageAmount * 2.16;
      if (s.cadence === 'yearly') return sum + s.averageAmount / 12;
      return sum + s.averageAmount;
    }, 0);

  const annualTotal = monthlyTotal * 12;

  const disabledCount = subscriptions.filter((s) => activeIds[s.merchant] === false).length;
  const potentialSavings = subscriptions
    .filter((s) => activeIds[s.merchant] === false)
    .reduce((sum, s) => sum + s.averageAmount * (s.cadence === 'yearly' ? 1 : 12), 0);

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-violet-950/30 via-zinc-900/60 to-zinc-900/60 p-6 backdrop-blur-xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30">
                <RefreshCw className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-white">
                Detected Recurring Bills &amp; Subscriptions
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Automatically detected based on repeating charge intervals and consistent merchant billing amounts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2 text-right">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 block">
                Monthly Recurring Burn
              </span>
              <span className="text-lg font-extrabold text-white">
                {formatCurrency(monthlyTotal, currency, { hideDecimals: true })}
                <span className="text-xs text-zinc-400 font-normal"> /mo</span>
              </span>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2 text-right">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 block">
                Annual Commitment
              </span>
              <span className="text-lg font-extrabold text-violet-400">
                {formatCurrency(annualTotal, currency, { hideDecimals: true })}
                <span className="text-xs text-zinc-400 font-normal"> /yr</span>
              </span>
            </div>
          </div>
        </div>

        {/* Potential savings pill if toggled */}
        {disabledCount > 0 && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-300">
            <PiggyBank className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>
              By cutting <strong>{disabledCount}</strong> selected service(s), you would save{' '}
              <strong>{formatCurrency(potentialSavings, currency, { hideDecimals: true })} / year</strong>!
            </span>
          </div>
        )}
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.map((sub) => {
          const isActive = activeIds[sub.merchant] !== false;
          return (
            <div
              key={sub.merchant}
              className={`rounded-2xl border p-4 backdrop-blur-xl transition ${
                isActive
                  ? 'border-zinc-800/80 bg-zinc-900/60 hover:border-violet-500/40'
                  : 'border-zinc-800/40 bg-zinc-950/30 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700">
                    <CreditCard className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{sub.merchant}</h3>
                    <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-400">
                      {sub.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleSub(sub.merchant)}
                  className={`rounded-lg px-2 py-1 text-[11px] font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-rose-950/40 hover:text-rose-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                  title={isActive ? 'Simulate cancelling this subscription' : 'Restore'}
                >
                  {isActive ? 'Simulate Cut' : 'Restored'}
                </button>
              </div>

              {/* Stats */}
              <div className="mt-4 flex items-baseline justify-between border-t border-zinc-800/60 pt-3">
                <div>
                  <span className="text-xl font-extrabold text-white">
                    {formatCurrency(sub.averageAmount, currency)}
                  </span>
                  <span className="text-xs text-zinc-400"> / {sub.cadence}</span>
                </div>
                <div className="text-right text-[11px] text-zinc-400">
                  <span>Confidence: </span>
                  <strong className="text-emerald-400 font-semibold">
                    {Math.round(sub.confidenceScore * 100)}%
                  </strong>
                </div>
              </div>

              {/* Dates */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 rounded-lg bg-zinc-950/50 p-2 border border-zinc-800/40">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-zinc-500" /> Next Bill:
                </span>
                <span className="font-semibold text-zinc-200">{sub.nextProjectedDate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
