'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { TimeSeriesForecastPoint, BudgetBurnRate } from '@/types/finance';
import { CurrencyCode, formatCurrency } from '@/lib/currency';

interface ForecastViewProps {
  forecastPoints: TimeSeriesForecastPoint[];
  burnRates: BudgetBurnRate[];
  currency: CurrencyCode;
}

export const ForecastView: React.FC<ForecastViewProps> = ({ forecastPoints, burnRates, currency }) => {
  const projectedOnly = forecastPoints.filter((p) => p.isProjected);
  const nextMonthForecast = projectedOnly[0]?.forecast || 0;
  const inTwoMonthsForecast = projectedOnly[1]?.forecast || 0;
  const inThreeMonthsForecast = projectedOnly[2]?.forecast || 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: TimeSeriesForecastPoint = payload[0].payload;
      return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 p-3 shadow-2xl backdrop-blur-md text-xs">
          <p className="font-bold text-zinc-200 mb-1">{data.label}</p>
          <div className="space-y-1">
            <p className="text-emerald-400 font-semibold">
              Forecast: {formatCurrency(data.forecast, currency, { hideDecimals: true })}
            </p>
            {data.isProjected && (
              <p className="text-zinc-400 text-[11px]">
                Confidence Band: {formatCurrency(data.lowerBound, currency, { hideDecimals: true })} &ndash;{' '}
                {formatCurrency(data.upperBound, currency, { hideDecimals: true })}
              </p>
            )}
            {data.actual !== undefined && (
              <p className="text-zinc-400">
                Actual: {formatCurrency(data.actual, currency, { hideDecimals: true })}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Overview Header Banner */}
      <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-emerald-950/30 via-zinc-900/60 to-zinc-900/60 p-6 backdrop-blur-xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-white">
                Predictive Spending &amp; Budget Forecasting
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              Powered by <strong>Holt&apos;s Linear Exponential Smoothing</strong> time-series modeling
              and <strong>linear daily burn-rate velocity</strong> to project cash needs and anticipate
              budget overruns.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2 text-right">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 block">
                Next Month Proj.
              </span>
              <span className="text-lg font-extrabold text-emerald-400">
                {formatCurrency(nextMonthForecast, currency, { hideDecimals: true })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 30 / 60 / 90 Day Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-md backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>+30 Days Outlook</span>
            <Calendar className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {formatCurrency(nextMonthForecast, currency, { hideDecimals: true })}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Range: {formatCurrency(projectedOnly[0]?.lowerBound || 0, currency, { hideDecimals: true })} &ndash;{' '}
            {formatCurrency(projectedOnly[0]?.upperBound || 0, currency, { hideDecimals: true })}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-md backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>+60 Days Outlook</span>
            <Calendar className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {formatCurrency(inTwoMonthsForecast, currency, { hideDecimals: true })}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Range: {formatCurrency(projectedOnly[1]?.lowerBound || 0, currency, { hideDecimals: true })} &ndash;{' '}
            {formatCurrency(projectedOnly[1]?.upperBound || 0, currency, { hideDecimals: true })}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-md backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>+90 Days Outlook</span>
            <Calendar className="h-4 w-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {formatCurrency(inThreeMonthsForecast, currency, { hideDecimals: true })}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Range: {formatCurrency(projectedOnly[2]?.lowerBound || 0, currency, { hideDecimals: true })} &ndash;{' '}
            {formatCurrency(projectedOnly[2]?.upperBound || 0, currency, { hideDecimals: true })}
          </p>
        </div>
      </div>

      {/* Time-Series Holt-Winters Chart */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
              Holt-Winters Trajectory &amp; Confidence Envelope
            </h3>
            <p className="text-xs text-zinc-400">
              Historical actual expenditures connected into smoothed multi-month forecast
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="h-0.5 w-3 bg-cyan-400" /> Forecast
            </span>
            <span className="flex items-center gap-1 text-zinc-400">
              <span className="h-2 w-2 rounded bg-cyan-500/20" /> Confidence Band
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastPoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="label"
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
              <Area
                type="monotone"
                dataKey="upperBound"
                stroke="transparent"
                fill="#06b6d4"
                fillOpacity={0.15}
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#forecastArea)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Burn-Rate Projections Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-800/80">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
              End-of-Month Category Burn-Rate Forecast
            </h3>
            <p className="text-xs text-zinc-400">
              Formula: <code>Projected = (Current Spent / Days Elapsed) &times; Total Days</code>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Budget</th>
                <th className="py-2.5 px-3 text-right">Spent to Date</th>
                <th className="py-2.5 px-3 text-right">Daily Burn</th>
                <th className="py-2.5 px-3 text-right">Projected Total</th>
                <th className="py-2.5 px-3 text-right">Projected Overrun</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {burnRates.map((b) => (
                <tr key={b.categoryId} className="hover:bg-zinc-800/30">
                  <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: b.color }}
                    />
                    {b.categoryName}
                  </td>
                  <td className="py-3 px-3 text-right text-zinc-300 font-mono">
                    {formatCurrency(b.monthlyLimit, currency, { hideDecimals: true })}
                  </td>
                  <td className="py-3 px-3 text-right text-zinc-200 font-mono">
                    {formatCurrency(b.currentSpent, currency, { hideDecimals: true })} ({b.percentSpent}%)
                  </td>
                  <td className="py-3 px-3 text-right text-zinc-400 font-mono">
                    {formatCurrency(b.dailyBurnRate, currency, { hideDecimals: true })}/d
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-white">
                    {formatCurrency(b.projectedTotal, currency, { hideDecimals: true })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {b.projectedOverrun > 0 ? (
                      <span className="text-rose-400 font-bold">
                        +{formatCurrency(b.projectedOverrun, currency, { hideDecimals: true })} ({b.projectedPercent - 100}%)
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-medium">Within limit</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {b.isOverBudgetRisk ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">
                        <AlertTriangle className="h-3 w-3" /> Overrun Risk
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck className="h-3 w-3" /> Safe
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
