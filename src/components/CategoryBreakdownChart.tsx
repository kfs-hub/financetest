'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CategoryBreakdown } from '@/types/finance';
import { CurrencyCode, formatCurrency } from '@/lib/currency';

interface CategoryBreakdownChartProps {
  data: CategoryBreakdown[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  currency: CurrencyCode;
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
  data,
  selectedCategory,
  onSelectCategory,
  currency,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-zinc-500 text-sm">
        No expense transactions to categorize yet.
      </div>
    );
  }

  const grandTotal = data.reduce((acc, curr) => acc + curr.total, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: CategoryBreakdown = payload[0].payload;
      return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 p-3 shadow-2xl backdrop-blur-md text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="font-bold text-white">{item.category}</span>
          </div>
          <p className="text-zinc-300 font-medium">
            Total:{' '}
            <strong className="text-white">
              {formatCurrency(item.total, currency, { hideDecimals: true })}
            </strong>{' '}
            ({item.percentage}%)
          </p>
          <p className="text-zinc-400 text-[11px] mt-0.5">
            {item.transactionCount} recorded transactions
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Category Breakdown
          </h2>
          <p className="text-xs text-zinc-400">
            Expense share distribution across categories
          </p>
        </div>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
          >
            Clear filter ({selectedCategory})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
        {/* Donut Chart */}
        <div className="relative h-64 md:col-span-6 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={95}
                paddingAngle={3}
                onClick={(_, index) => {
                  const clicked = data[index];
                  onSelectCategory(selectedCategory === clicked.category ? null : clicked.category);
                }}
              >
                {data.map((entry) => (
                  <Cell
                    key={`cell-${entry.category}`}
                    fill={entry.color}
                    opacity={
                      selectedCategory === null || selectedCategory === entry.category ? 1 : 0.35
                    }
                    stroke="#18181b"
                    strokeWidth={2}
                    className="cursor-pointer transition-all duration-200"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Donut Center Display */}
          <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400">Total Outflow</span>
            <span className="text-base font-extrabold text-white">
              {formatCurrency(grandTotal, currency, { hideDecimals: true, compact: true })}
            </span>
          </div>
        </div>

        {/* Legend / Category List with Progress Bars */}
        <div className="md:col-span-6 space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
          {data.map((cat) => {
            const isSelected = selectedCategory === cat.category;
            return (
              <div
                key={cat.category}
                onClick={() => onSelectCategory(isSelected ? null : cat.category)}
                className={`flex flex-col rounded-lg p-2 text-xs transition cursor-pointer border ${
                  isSelected
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-transparent hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate font-medium text-zinc-200">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {formatCurrency(cat.total, currency, { hideDecimals: true })}
                    </span>
                    <span className="text-zinc-400 w-10 text-right">{cat.percentage}%</span>
                  </div>
                </div>
                <div className="mt-1.5 h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
