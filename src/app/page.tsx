'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Transaction,
  Category,
  CategorizationRule,
} from '@/types/finance';
import { DEFAULT_CATEGORIES } from '@/lib/constants';
import { CurrencyCode, DEFAULT_CURRENCY } from '@/lib/currency';
import {
  detectAnomalies,
  calculateCategoryBreakdowns,
  calculateCashFlowTrends,
  calculateBudgetBurnRates,
  calculateTimeSeriesForecast,
  detectRecurringSubscriptions,
} from '@/lib/analytics';
import { buildFinancialContext } from '@/lib/gemini';
import {
  getStoredTransactions,
  saveStoredTransactions,
  getStoredCategories,
  getStoredRules,
  saveStoredRules,
  resetToSampleData,
} from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/supabase';
import { loadTransactions, persistTransactions } from '@/lib/dbService';

// UI Components
import { Header, ActiveTab } from '@/components/Header';
import { KPICards } from '@/components/KPICards';
import { CashflowChart } from '@/components/CashflowChart';
import { CategoryBreakdownChart } from '@/components/CategoryBreakdownChart';
import { AnomalyBanner } from '@/components/AnomalyBanner';
import { BurnRateWidget } from '@/components/BurnRateWidget';
import { TransactionTable } from '@/components/TransactionTable';
import { CsvImportModal } from '@/components/CsvImportModal';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { ForecastView } from '@/components/ForecastView';
import { SubscriptionsView } from '@/components/SubscriptionsView';
import { AICopilot } from '@/components/AICopilotDrawer';
import { SupabaseSqlModal } from '@/components/SupabaseSqlModal';
import { ApiKeyModal } from '@/components/ApiKeyModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [userRules, setUserRules] = useState<CategorizationRule[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isSqlOpen, setIsSqlOpen] = useState(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<Record<string, boolean>>({});

  // Initialize data on mount
  useEffect(() => {
    async function init() {
      const savedCurrency = (localStorage.getItem('pfa_currency') as CurrencyCode) || DEFAULT_CURRENCY;
      setCurrency(savedCurrency);

      const dbRes = await loadTransactions();
      setTransactions(dbRes.data);

      const cats = getStoredCategories();
      const rls = getStoredRules();
      const savedKey = localStorage.getItem('pfa_gemini_key') || '';

      setCategories(cats);
      setUserRules(rls);
      setApiKey(savedKey);
      setIsSupabaseConnected(isSupabaseConfigured());
    }
    init();
  }, []);

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    localStorage.setItem('pfa_currency', newCurrency);
  };

  // Compute Statistical Analytics & Model Outputs
  const { transactions: processedTx, alerts: anomalyAlerts } = useMemo(() => {
    return detectAnomalies(transactions, categories);
  }, [transactions, categories]);

  const categoryBreakdowns = useMemo(() => {
    return calculateCategoryBreakdowns(processedTx, categories);
  }, [processedTx, categories]);

  const cashflowTrends = useMemo(() => {
    return calculateCashFlowTrends(processedTx);
  }, [processedTx]);

  const burnRates = useMemo(() => {
    return calculateBudgetBurnRates(processedTx, categories);
  }, [processedTx, categories]);

  const forecastPoints = useMemo(() => {
    return calculateTimeSeriesForecast(cashflowTrends);
  }, [cashflowTrends]);

  const subscriptions = useMemo(() => {
    return detectRecurringSubscriptions(processedTx);
  }, [processedTx]);

  // Context for AI Financial Copilot
  const financialContext = useMemo(() => {
    return buildFinancialContext(
      processedTx,
      categories,
      burnRates,
      subscriptions,
      anomalyAlerts
    );
  }, [processedTx, categories, burnRates, subscriptions, anomalyAlerts]);

  // Total budget
  const totalBudget = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.monthlyBudget || 0), 0);
  }, [categories]);

  // Filter unacknowledged anomaly alerts
  const activeAnomalyAlerts = useMemo(() => {
    return anomalyAlerts.filter((a) => !acknowledgedAlertIds[a.id]);
  }, [anomalyAlerts, acknowledgedAlertIds]);

  // --- Handlers ---
  const handleImportSuccess = (newTx: Transaction[]) => {
    const combined = [...newTx, ...transactions];
    const { transactions: cleaned } = detectAnomalies(combined, categories);
    setTransactions(cleaned);
    persistTransactions(cleaned);
    setActiveTab('dashboard');
  };

  const handleAddTransaction = (newTx: Transaction) => {
    const updated = [newTx, ...transactions];
    const { transactions: cleaned } = detectAnomalies(updated, categories);
    setTransactions(cleaned);
    persistTransactions(cleaned);
  };

  const handleDeleteTransaction = (txId: string) => {
    const updated = transactions.filter((t) => t.id !== txId);
    setTransactions(updated);
    saveStoredTransactions(updated);
  };

  const handleUpdateCategory = (txId: string, newCategory: string, createRule: boolean) => {
    const targetTx = transactions.find((t) => t.id === txId);
    let updatedRules = userRules;

    if (createRule && targetTx) {
      const newRule: CategorizationRule = {
        id: `rule-${Date.now()}`,
        pattern: targetTx.cleanMerchant.toLowerCase(),
        targetCategory: newCategory,
        cleanMerchantName: targetTx.cleanMerchant,
        createdAt: new Date().toISOString(),
      };
      updatedRules = [newRule, ...userRules];
      setUserRules(updatedRules);
      saveStoredRules(updatedRules);
    }

    const updated = transactions.map((t) => {
      if (t.id === txId) {
        return { ...t, category: newCategory };
      }
      if (createRule && targetTx && t.cleanMerchant === targetTx.cleanMerchant) {
        return { ...t, category: newCategory };
      }
      return t;
    });

    setTransactions(updated);
    persistTransactions(updated);
  };

  const handleAcknowledgeAlert = (id: string) => {
    setAcknowledgedAlertIds((prev) => ({ ...prev, [id]: true }));
  };

  const handleFilterToTransaction = (txId: string) => {
    setActiveTab('transactions');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all financial data back to the realistic 6-month Indian statement (in ₹ INR)?')) {
      const samples = resetToSampleData();
      setTransactions(samples);
      setAcknowledgedAlertIds({});
      persistTransactions(samples);
    }
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('pfa_gemini_key', key);
  };

  const currentCashflow = cashflowTrends[cashflowTrends.length - 1];
  const previousCashflow = cashflowTrends[cashflowTrends.length - 2];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500 selection:text-zinc-950 font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        isSupabaseConnected={isSupabaseConnected}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAddTx={() => setIsAddTxOpen(true)}
        onResetData={handleResetData}
        onOpenSql={() => setIsSqlOpen(true)}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        hasApiKey={Boolean(apiKey)}
        anomalyCount={activeAnomalyAlerts.length}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <AnomalyBanner
              alerts={activeAnomalyAlerts}
              onAcknowledge={handleAcknowledgeAlert}
              onFilterTransaction={handleFilterToTransaction}
              currency={currency}
            />

            <KPICards
              currentCashflow={currentCashflow}
              previousCashflow={previousCashflow}
              burnRates={burnRates}
              totalBudget={totalBudget}
              currency={currency}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <CashflowChart data={cashflowTrends} currency={currency} />
              </div>
              <div className="lg:col-span-5">
                <CategoryBreakdownChart
                  data={categoryBreakdowns}
                  selectedCategory={selectedCategoryFilter}
                  onSelectCategory={(cat) => {
                    setSelectedCategoryFilter(cat);
                    if (cat) setActiveTab('transactions');
                  }}
                  currency={currency}
                />
              </div>
            </div>

            <BurnRateWidget burnRates={burnRates} currency={currency} />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
                  Recent Transactions
                </h3>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs text-emerald-400 hover:underline font-medium cursor-pointer"
                >
                  View All ({processedTx.length}) &rarr;
                </button>
              </div>
              <TransactionTable
                transactions={processedTx.slice(0, 8)}
                categories={categories}
                onUpdateCategory={handleUpdateCategory}
                onDeleteTransaction={handleDeleteTransaction}
                selectedCategoryFilter={selectedCategoryFilter}
                onClearCategoryFilter={() => setSelectedCategoryFilter(null)}
                currency={currency}
              />
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Transactions Management</h2>
                <p className="text-xs text-zinc-400">
                  Filter, search, inspect anomalies, and reclassify categories with UPI intelligence.
                </p>
              </div>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-md cursor-pointer"
              >
                + Import Bank Statement
              </button>
            </div>

            <TransactionTable
              transactions={processedTx}
              categories={categories}
              onUpdateCategory={handleUpdateCategory}
              onDeleteTransaction={handleDeleteTransaction}
              selectedCategoryFilter={selectedCategoryFilter}
              onClearCategoryFilter={() => setSelectedCategoryFilter(null)}
              currency={currency}
            />
          </div>
        )}

        {activeTab === 'forecast' && (
          <ForecastView forecastPoints={forecastPoints} burnRates={burnRates} currency={currency} />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionsView subscriptions={subscriptions} currency={currency} />
        )}

        {activeTab === 'copilot' && (
          <AICopilot financialContext={financialContext} apiKey={apiKey} />
        )}
      </main>

      {/* Modals */}
      <CsvImportModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImportSuccess={handleImportSuccess}
        userRules={userRules}
      />

      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onAddTransaction={handleAddTransaction}
        categories={categories}
      />

      <SupabaseSqlModal
        isOpen={isSqlOpen}
        onClose={() => setIsSqlOpen(false)}
        onConnectionChange={() => setIsSupabaseConnected(isSupabaseConfigured())}
      />

      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />
    </div>
  );
}
