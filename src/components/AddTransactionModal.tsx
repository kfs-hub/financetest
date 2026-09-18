'use client';

import React, { useState } from 'react';
import { PlusCircle, X, DollarSign, Calendar, Tag, CreditCard } from 'lucide-react';
import { Transaction, Category } from '@/types/finance';
import { cleanMerchantName, categorizeTransaction } from '@/lib/categorizer';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Transaction) => void;
  categories: Category[];
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  categories,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState(categories[0]?.name || 'Dining & Restaurants');
  const [account, setAccount] = useState('Chase Checking');

  if (!isOpen) return null;

  const handleDescChange = (val: string) => {
    setDescription(val);
    if (val.trim().length >= 3) {
      const auto = categorizeTransaction(val);
      setCategory(auto.category);
      if (auto.category === 'Income & Salary') {
        setType('income');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(amount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) return;

    const newTx: Transaction = {
      id: `tx-manual-${Date.now()}`,
      date,
      amount: Math.round(parsedAmt * 100) / 100,
      type,
      category,
      rawDescription: description.trim(),
      cleanMerchant: cleanMerchantName(description),
      source: 'manual',
      account,
      tags: [],
      createdAt: new Date().toISOString(),
    };

    onAddTransaction(newTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <PlusCircle className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white">Add Manual Transaction</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {/* Description & Auto-categorize */}
          <div>
            <label className="text-zinc-300 font-medium block mb-1">
              Description / Merchant Name
            </label>
            <input
              id="input-tx-description"
              type="text"
              required
              placeholder="e.g. Starbucks #1042, Trader Joe's, Uber"
              value={description}
              onChange={(e) => handleDescChange(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Amount & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-300 font-medium block mb-1">Amount ($)</label>
              <input
                id="input-tx-amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-200 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-zinc-300 font-medium block mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-300 font-medium block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-200 focus:border-emerald-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-zinc-300 font-medium block mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Account */}
          <div>
            <label className="text-zinc-300 font-medium block mb-1">Account</label>
            <input
              type="text"
              placeholder="e.g. Chase Checking / Amex"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              id="btn-submit-new-tx"
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 shadow-md transition"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
