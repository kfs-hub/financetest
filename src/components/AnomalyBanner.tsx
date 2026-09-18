'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react';
import { AnomalyAlert } from '@/types/finance';
import { CurrencyCode, formatCurrency } from '@/lib/currency';

interface AnomalyBannerProps {
  alerts: AnomalyAlert[];
  onAcknowledge: (id: string) => void;
  onFilterTransaction: (txId: string) => void;
  currency: CurrencyCode;
}

export const AnomalyBanner: React.FC<AnomalyBannerProps> = ({
  alerts,
  onAcknowledge,
  onFilterTransaction,
  currency,
}) => {
  const unreadAlerts = alerts.filter((a) => a.status === 'unread');

  if (unreadAlerts.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-zinc-900/60 to-zinc-900/60 p-4 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                Statistical Anomaly Detected ({unreadAlerts.length})
              </h3>
              <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300 border border-rose-500/30">
                Formula: Amount &gt; &mu; + 2&sigma;
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Transactions that deviate significantly from your historical category baseline.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        {unreadAlerts.map((alert) => (
          <div
            key={alert.id}
            className="flex flex-col justify-between rounded-xl border border-rose-500/20 bg-zinc-950/60 p-3 text-xs"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-semibold text-white text-sm">{alert.merchant}</span>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">
                      {alert.category}
                    </span>
                    <span>{alert.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-rose-400">
                    {formatCurrency(alert.amount, currency)}
                  </span>
                </div>
              </div>

              {/* Formula & Deviation Details */}
              <div className="mt-2.5 rounded-lg bg-zinc-900/80 p-2 border border-zinc-800 text-[11px] space-y-1">
                <div className="flex justify-between text-zinc-300">
                  <span>Category Baseline (&mu;):</span>
                  <strong className="text-white">
                    {formatCurrency(alert.categoryMean, currency)}
                  </strong>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Threshold (&mu; + 2&sigma;):</span>
                  <strong className="text-amber-400">
                    {formatCurrency(alert.threshold, currency)}
                  </strong>
                </div>
                <div className="flex justify-between text-rose-400 font-semibold pt-1 border-t border-zinc-800">
                  <span>Deviation:</span>
                  <span>
                    +{formatCurrency(alert.amount - alert.threshold, currency)} beyond 2&sigma;
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => onFilterTransaction(alert.transactionId)}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-emerald-400 transition"
              >
                Inspect in table <ExternalLink className="h-3 w-3" />
              </button>
              <button
                onClick={() => onAcknowledge(alert.id)}
                className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-200 hover:bg-zinc-700 transition"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                Acknowledge
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
