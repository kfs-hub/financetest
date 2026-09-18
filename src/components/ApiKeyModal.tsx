'use client';

import React, { useState } from 'react';
import { Key, Check, X, Shield, Sparkles, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
}) => {
  const [val, setVal] = useState(apiKey);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(val.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Key className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white">Google Gemini API Key</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs">
          <p className="text-zinc-400">
            Provide a Google Gemini API key to enable live generative AI responses in the Financial Copilot.
          </p>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-emerald-300">
            <span className="flex items-center gap-1.5 font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> Offline fallback is active:
            </span>
            <p className="text-[11px] text-zinc-400 mt-1">
              Even without an API key, the built-in deterministic Financial Copilot analyzes your cash flows, anomalies, and run-rates completely locally in your browser.
            </p>
          </div>

          <div>
            <label className="text-zinc-300 font-medium block mb-1">Gemini API Key</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-200 font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
          >
            Get a free Gemini API key from Google AI Studio <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-zinc-800 text-xs">
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 shadow-md transition"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
};
