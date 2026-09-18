'use client';

import React from 'react';
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ComposedChart,
} from 'recharts';
import { CashFlowMonth } from '@/types/finance';
import { CurrencyCode, formatCurrency } from '@/lib/currency';

interface CashflowChartProps {
  data: CashFlowMonth[];
  currency: CurrencyCode;
}

export const CashflowChart: React.FC<CashflowChartProps> = ({ data, currency }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-zinc-500 text-sm">
        No cashflow data available yet.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const income = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
      const expense = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;
      const netSavings = income - expense;
      const rate = income > 0 ? Math.round((netSavings / income) * 100) : 0;

      return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 p-3 shadow-2xl backdrop-blur-md text-xs">
          <p className="font-bold text-zinc-200 mb-2 border-b border-zinc-800 pb-1">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Inflow:
              </span>
              <span className="font-semibold text-white">
                {formatCurrency(income, currency, { hideDecimals: true })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Outflow:
              </span>
              <span className="font-semibold text-white">
                {formatCurrency(expense, currency, { hideDecimals: true })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-zinc-800/80">
              <span className="text-cyan-400">Net Retention:</span>
              <span className={`font-bold ${netSavings >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                {formatCurrency(netSavings, currency, { hideDecimals: true })} ({rate}%)
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Cash Flow Trends (Inflow vs Outflow)
          </h2>
          <p className="text-xs text-zinc-400">
            Monthly comparison of total credits vs total expenditures
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <span className="h-2.5 w-2.5 rounded bg-emerald-500" /> Income
          </span>
          <span className="flex items-center gap-1.5 text-zinc-300">
            <span className="h-2.5 w-2.5 rounded bg-rose-500" /> Expenses
          </span>
          <span className="flex items-center gap-1.5 text-zinc-300">
            <span className="h-0.5 w-3 bg-cyan-400" /> Net Savings
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="monthLabel"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
            />
            <YAxis
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatCurrency(v, currency, { compact: true, hideDecimals: true })}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Line
              type="monotone"
              dataKey="netSavings"
              stroke="#06b6d4"
              strokeWidth={2.5}
              dot={{ fill: '#06b6d4', r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
