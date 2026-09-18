'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  AlertTriangle,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Transaction, Category } from '@/types/finance';
import { CurrencyCode, formatCurrency } from '@/lib/currency';

interface TransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
  onUpdateCategory: (txId: string, newCategory: string, createRule: boolean) => void;
  onDeleteTransaction: (txId: string) => void;
  selectedCategoryFilter: string | null;
  onClearCategoryFilter: () => void;
  currency: CurrencyCode;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  categories,
  onUpdateCategory,
  onDeleteTransaction,
  selectedCategoryFilter,
  onClearCategoryFilter,
  currency,
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>(selectedCategoryFilter || 'all');
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  React.useEffect(() => {
    if (selectedCategoryFilter) {
      setSelectedCategory(selectedCategoryFilter);
      setPage(1);
    }
  }, [selectedCategoryFilter]);

  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [newCatChoice, setNewCatChoice] = useState('');
  const [saveAsRule, setSaveAsRule] = useState(true);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedType !== 'all' && tx.type !== selectedType) return false;
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;
      if (showAnomaliesOnly && !tx.isAnomaly) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          tx.cleanMerchant.toLowerCase().includes(q) ||
          tx.rawDescription.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q) ||
          tx.account.toLowerCase().includes(q) ||
          String(tx.amount).includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [transactions, selectedType, selectedCategory, showAnomaliesOnly, search]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleOpenEditCat = (tx: Transaction) => {
    setEditingTx(tx);
    setNewCatChoice(tx.category);
    setSaveAsRule(true);
  };

  const handleSaveCategory = () => {
    if (editingTx && newCatChoice) {
      onUpdateCategory(editingTx.id, newCatChoice, saveAsRule);
      setEditingTx(null);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl shadow-lg overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-zinc-800/80 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              id="input-search-transactions"
              type="text"
              placeholder="Search merchant, UPI ID, description, amount..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Filter options */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              id="select-tx-type"
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as any);
                setPage(1);
              }}
              className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>

            <select
              id="select-tx-category"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              id="btn-toggle-anomalies"
              onClick={() => {
                setShowAnomaliesOnly(!showAnomaliesOnly);
                setPage(1);
              }}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                showAnomaliesOnly
                  ? 'border-rose-500/40 bg-rose-500/20 text-rose-300'
                  : 'border-zinc-800 bg-zinc-950/80 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              <span>Anomalies Only</span>
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
          <span>
            Showing <strong className="text-zinc-200">{filtered.length}</strong> transactions
            {selectedCategory !== 'all' && (
              <span className="ml-2 text-emerald-400">
                (Filtered: {selectedCategory}{' '}
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    onClearCategoryFilter();
                  }}
                  className="underline ml-1 text-zinc-400 hover:text-white cursor-pointer"
                >
                  Clear
                </button>
                )
              </span>
            )}
          </span>
          <span>
            Page {page} of {totalPages}
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-zinc-800/80 bg-zinc-950/40 text-zinc-400 uppercase font-semibold text-[11px]">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Merchant &amp; Description</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Account / VPA</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-500">
                  No transactions match the selected filters.
                </td>
              </tr>
            ) : (
              paginated.map((tx) => {
                const categoryObj = categories.find((c) => c.name === tx.category);
                const isIncome = tx.type === 'income' || tx.category === 'Income & Salary';
                const isUpi = tx.rawDescription.toLowerCase().includes('upi') || tx.tags.includes('upi');

                return (
                  <tr
                    key={tx.id}
                    className={`transition hover:bg-zinc-800/30 ${
                      tx.isAnomaly ? 'bg-rose-950/10' : ''
                    }`}
                  >
                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap text-zinc-400 font-mono">
                      {tx.date}
                    </td>

                    {/* Merchant & Raw Description */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{tx.cleanMerchant}</span>
                        {isUpi && (
                          <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-medium text-cyan-400 border border-cyan-500/20">
                            UPI
                          </span>
                        )}
                        {tx.isRecurring && (
                          <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-[10px] text-violet-400 border border-violet-500/20">
                            Recurring
                          </span>
                        )}
                        {tx.isAnomaly && (
                          <span
                            className="flex items-center gap-1 rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30"
                            title={tx.anomalyReason}
                          >
                            <AlertTriangle className="h-3 w-3" />
                            &mu; + 2&sigma;
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate max-w-xs sm:max-w-md font-mono mt-0.5">
                        {tx.rawDescription}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditCat(tx)}
                        className="group flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition border border-zinc-800 bg-zinc-950/60 hover:border-emerald-500/50 cursor-pointer"
                        title="Click to reclassify category"
                      >
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: categoryObj?.color || '#94a3b8' }}
                        />
                        <span className="text-zinc-200 group-hover:text-emerald-300">
                          {tx.category}
                        </span>
                      </button>
                    </td>

                    {/* Account */}
                    <td className="py-3 px-4 whitespace-nowrap text-zinc-400 text-[11px]">
                      {tx.account}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold">
                      <span className={isIncome ? 'text-emerald-400' : 'text-zinc-100'}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                      </span>
                    </td>

                    {/* Delete action */}
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="text-zinc-600 hover:text-rose-400 transition p-1 cursor-pointer"
                        title="Delete transaction"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between p-4 border-t border-zinc-800/80 bg-zinc-950/40 text-xs">
        <span className="text-zinc-400">
          Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filtered.length)} of{' '}
          {filtered.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-zinc-300 disabled:opacity-40 hover:bg-zinc-800 transition cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-zinc-300 disabled:opacity-40 hover:bg-zinc-800 transition cursor-pointer"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Edit Category Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white">Reclassify Transaction</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Select a new category for <strong>{editingTx.cleanMerchant}</strong>.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-300">Category</label>
                <select
                  value={newCatChoice}
                  onChange={(e) => setNewCatChoice(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveAsRule}
                    onChange={(e) => setSaveAsRule(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      Auto-apply to future transactions
                    </span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Creates a Tier 1 custom rule to automatically classify future UPI / card charges from &ldquo;{editingTx.cleanMerchant}&rdquo; as {newCatChoice}.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingTx(null)}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md cursor-pointer"
              >
                Save Classification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
