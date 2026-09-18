'use client';

import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  TrendingUp,
  RefreshCw,
  Bot,
  Database,
  Upload,
  PlusCircle,
  RotateCcw,
  Sparkles,
  Key,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { CurrencyCode, SUPPORTED_CURRENCIES } from '@/lib/currency';

export type ActiveTab = 'dashboard' | 'transactions' | 'forecast' | 'subscriptions' | 'copilot';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  isSupabaseConnected: boolean;
  onOpenUpload: () => void;
  onOpenAddTx: () => void;
  onResetData: () => void;
  onOpenSql: () => void;
  onOpenApiKey: () => void;
  hasApiKey: boolean;
  anomalyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currency,
  onCurrencyChange,
  isSupabaseConnected,
  onOpenUpload,
  onOpenAddTx,
  onResetData,
  onOpenSql,
  onOpenApiKey,
  hasApiKey,
  anomalyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-zinc-950 shadow-lg shadow-emerald-500/20">
            <TrendingUp className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                Apex<span className="text-emerald-400">Finance</span>
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                <Sparkles className="h-3 w-3" /> UPI & AI
              </span>
            </div>
            <p className="hidden text-xs text-zinc-400 sm:block">
              UPI Intelligence • Spending Analytics • Predictive Forecasting
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Currency Switcher Dropdown */}
          <div className="relative">
            <select
              id="select-currency"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
              className="appearance-none rounded-lg border border-zinc-800 bg-zinc-900/90 pl-2.5 pr-7 py-1.5 text-xs font-semibold text-zinc-200 hover:border-emerald-500/40 focus:border-emerald-500 focus:outline-none transition cursor-pointer"
              title="Switch Currency (Default: Indian Rupee ₹)"
            >
              {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} ({c.symbol})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-2.5 text-[10px] text-zinc-400">
              ▼
            </div>
          </div>

          <button
            id="btn-upload-csv"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition"
            title="Import Bank or UPI statement"
          >
            <Upload className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          <button
            id="btn-add-transaction"
            onClick={onOpenAddTx}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Transaction</span>
          </button>

          {/* Supabase Real DB Connection Button */}
          <button
            id="btn-sql-schema"
            onClick={onOpenSql}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
              isSupabaseConnected
                ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white'
            }`}
            title="Configure Supabase PostgreSQL Database"
          >
            <Database className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden md:inline">
              {isSupabaseConnected ? 'Cloud DB Live' : 'Supabase DB'}
            </span>
          </button>

          <button
            id="btn-api-key"
            onClick={onOpenApiKey}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition ${
              hasApiKey
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Configure Gemini API Key"
          >
            <Key className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{hasApiKey ? 'AI Connected' : 'API Key'}</span>
          </button>

          <button
            id="btn-reset-demo"
            onClick={onResetData}
            className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2 py-1.5 text-xs text-zinc-400 hover:text-rose-300 hover:border-rose-900 transition"
            title="Reset to Demo Indian Statement"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-zinc-800/80 bg-zinc-900/40 px-4 sm:px-6">
        <nav className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto py-1.5 scrollbar-none">
          <button
            id="nav-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeTab === 'dashboard'
                ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </button>

          <button
            id="nav-transactions"
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeTab === 'transactions'
                ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
            }`}
          >
            <ReceiptText className="h-4 w-4" />
            Transactions
            {anomalyCount > 0 && (
              <span className="ml-1 rounded-full bg-rose-500/20 px-1.5 py-0.2 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                {anomalyCount}
              </span>
            )}
          </button>

          <button
            id="nav-forecast"
            onClick={() => setActiveTab('forecast')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeTab === 'forecast'
                ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Predictions & Forecast
          </button>

          <button
            id="nav-subscriptions"
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeTab === 'subscriptions'
                ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
            }`}
          >
            <RefreshCw className="h-4 w-4" />
            Recurring & Subscriptions
          </button>

          <button
            id="nav-copilot"
            onClick={() => setActiveTab('copilot')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeTab === 'copilot'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
            }`}
          >
            <Bot className="h-4 w-4 text-emerald-400" />
            AI Financial Copilot
          </button>
        </nav>
      </div>
    </header>
  );
};
