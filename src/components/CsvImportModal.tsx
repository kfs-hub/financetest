'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, X, Sparkles } from 'lucide-react';
import { parseCsvTransactions, ColumnMapping } from '@/lib/csvParser';
import { Transaction, CategorizationRule } from '@/types/finance';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (transactions: Transaction[]) => void;
  userRules: CategorizationRule[];
}

const SAMPLE_CSV_CONTENT = `Posting Date,Description,Amount,Type
2026-09-16,NETFLIX.COM 866-579-7172 CA,-22.99,Expense
2026-09-15,DIRECT DEP ACME CORP PAYROLL,3250.00,Income
2026-09-14,SQ *BLUE BOTTLE COFFEE SAN FRANCISCO,-6.75,Expense
2026-09-12,WHOLEFDS SFO 10294,-112.45,Expense
2026-09-10,CHIPOTLE 2918 ONLINE ORDER,-18.20,Expense
2026-09-08,PACIFIC GAS & ELECTRIC ONLINE PMT,-142.10,Expense
2026-09-05,AMZN Mktp US*MB89K8912 SEATTLE WA,-44.50,Expense
2026-09-01,AVALON APARTMENTS ACH RENT,-1550.00,Expense`;

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  userRules,
}) => {
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [accountName, setAccountName] = useState('Checking Statement');
  const [previewResult, setPreviewResult] = useState<ReturnType<typeof parseCsvTransactions> | null>(null);
  const [customMapping, setCustomMapping] = useState<Partial<ColumnMapping>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvText(text);
        runPreview(text, {});
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSampleCsv = () => {
    setFileName('Sample_Bank_Statement.csv');
    setCsvText(SAMPLE_CSV_CONTENT);
    runPreview(SAMPLE_CSV_CONTENT, {});
  };

  const runPreview = (text: string, mapping: Partial<ColumnMapping>) => {
    if (!text.trim()) {
      setPreviewResult(null);
      return;
    }
    const result = parseCsvTransactions(text, userRules, mapping, accountName);
    setPreviewResult(result);
  };

  const handleMappingChange = (field: keyof ColumnMapping, colName: string) => {
    const updated = { ...customMapping, [field]: colName };
    setCustomMapping(updated);
    runPreview(csvText, updated);
  };

  const handleConfirmImport = () => {
    if (previewResult && previewResult.transactions.length > 0) {
      onImportSuccess(previewResult.transactions);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Import Bank Statement (CSV)</h2>
              <p className="text-xs text-zinc-400">
                Auto-detects columns, cleans merchant descriptions, and applies AI categorization.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Account Name input */}
        <div className="mt-4 flex items-center gap-3 text-xs">
          <label className="text-zinc-300 font-medium whitespace-nowrap">Target Account:</label>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-200 focus:border-emerald-500 focus:outline-none"
            placeholder="e.g. Chase Sapphire / Wells Fargo"
          />
        </div>

        {/* Upload Dropzone */}
        {!csvText ? (
          <div className="mt-4 space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center cursor-pointer transition hover:border-emerald-500/50 hover:bg-emerald-500/5"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <FileText className="h-10 w-10 text-zinc-500 group-hover:text-emerald-400 transition" />
              <p className="mt-3 text-xs font-semibold text-zinc-200">
                Click to browse or drop your bank CSV file here
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Supports Chase, Bank of America, Amex, Wells Fargo, Revolut, etc.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
              <span>Don&apos;t have a CSV on hand?</span>
              <button
                onClick={handleLoadSampleCsv}
                className="flex items-center gap-1 text-emerald-400 hover:underline font-medium cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Load sample statement
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* File info bar */}
            <div className="flex items-center justify-between rounded-xl bg-zinc-900/80 p-3 border border-zinc-800 text-xs">
              <div className="flex items-center gap-2 text-zinc-200">
                <FileText className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold">{fileName || 'Custom CSV'}</span>
                <span className="text-zinc-500">
                  ({previewResult?.validRows || 0} valid records detected)
                </span>
              </div>
              <button
                onClick={() => {
                  setCsvText('');
                  setFileName('');
                  setPreviewResult(null);
                }}
                className="text-xs text-zinc-400 hover:text-rose-400"
              >
                Clear file
              </button>
            </div>

            {/* Column Mapping Selectors */}
            {previewResult && previewResult.detectedHeaders.length > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs">
                <span className="font-semibold text-zinc-300 block mb-2">
                  Verify Detected Columns:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400">Date Column</label>
                    <select
                      value={customMapping.dateCol || previewResult.suggestedMapping.dateCol}
                      onChange={(e) => handleMappingChange('dateCol', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 text-zinc-200"
                    >
                      {previewResult.detectedHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400">Description / Merchant</label>
                    <select
                      value={customMapping.descriptionCol || previewResult.suggestedMapping.descriptionCol}
                      onChange={(e) => handleMappingChange('descriptionCol', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 text-zinc-200"
                    >
                      {previewResult.detectedHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400">Amount Column</label>
                    <select
                      value={customMapping.amountCol || previewResult.suggestedMapping.amountCol}
                      onChange={(e) => handleMappingChange('amountCol', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 text-zinc-200"
                    >
                      {previewResult.detectedHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Live Preview of Interpretation */}
            {previewResult && previewResult.transactions.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-zinc-300 mb-2 block">
                  Preview Interpreted Transactions (Top 4):
                </span>
                <div className="space-y-1.5">
                  {previewResult.transactions.slice(0, 4).map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-2 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">{t.cleanMerchant}</span>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                          <span>{t.date}</span>
                          <span className="rounded bg-emerald-500/10 text-emerald-400 px-1">
                            {t.category}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-zinc-200">
                        ${t.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer buttons */}
        <div className="mt-6 flex items-center justify-end gap-2 border-t border-zinc-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-import-csv"
            disabled={!previewResult || previewResult.transactions.length === 0}
            onClick={handleConfirmImport}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-40 transition shadow-lg shadow-emerald-600/20"
          >
            <CheckCircle2 className="h-4 w-4" />
            Import {previewResult?.validRows || 0} Transactions
          </button>
        </div>
      </div>
    </div>
  );
};
