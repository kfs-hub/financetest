'use client';

import React, { useState, useEffect } from 'react';
import { Database, Copy, Check, X, Shield, RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '@/lib/storage';
import { getSupabaseCredentials, testSupabaseConnection, isSupabaseConfigured } from '@/lib/supabase';
import { pushAllToSupabase } from '@/lib/dbService';

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChange?: () => void;
}

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ isOpen, onClose, onConnectionChange }) => {
  const [activeTab, setActiveTab] = useState<'connect' | 'sql'>('connect');
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncCount, setSyncCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setAnonKey(creds.anonKey);
      setTestStatus(isSupabaseConfigured() ? 'success' : 'idle');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveAndTest = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter both Supabase URL and Anon Key');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Testing connection to Supabase...');

    const res = await testSupabaseConnection(url.trim(), anonKey.trim());
    if (res.success) {
      setTestStatus('success');
      setTestMessage('Connected successfully! Table schema verified.');
      localStorage.setItem('pfa_supabase_url', url.trim());
      localStorage.setItem('pfa_supabase_key', anonKey.trim());
      if (onConnectionChange) onConnectionChange();
    } else {
      setTestStatus('error');
      setTestMessage(res.error || 'Could not verify database connection');
    }
  };

  const handlePushData = async () => {
    setSyncStatus('syncing');
    const res = await pushAllToSupabase();
    if (res.success) {
      setSyncStatus('success');
      setSyncCount(res.count);
    } else {
      setSyncStatus('error');
      setTestMessage(res.error || 'Failed to sync data');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Supabase Cloud Database Setup</h2>
              <p className="text-xs text-zinc-400">
                Connect your live PostgreSQL instance or copy the DDL schema.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b border-zinc-800/80 pt-3 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('connect')}
            className={`rounded-lg px-3 py-1 font-medium transition cursor-pointer ${
              activeTab === 'connect'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            1. Connect Live Database
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`rounded-lg px-3 py-1 font-medium transition cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            2. SQL Schema DDL
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {activeTab === 'connect' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-3">
                <div>
                  <label className="text-zinc-300 font-medium block mb-1">
                    Project URL (e.g. <code>https://your-project.supabase.co</code>)
                  </label>
                  <input
                    type="url"
                    placeholder="https://xyzcompany.supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-200 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-medium block mb-1">
                    Anon Public API Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-200 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                  >
                    Find credentials in Supabase Dashboard &rarr; Settings &rarr; API <ExternalLink className="h-3 w-3" />
                  </a>

                  <button
                    onClick={handleSaveAndTest}
                    disabled={testStatus === 'testing'}
                    className="rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-500 disabled:opacity-40 transition cursor-pointer"
                  >
                    {testStatus === 'testing' ? 'Testing...' : 'Save & Verify Connection'}
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              {testStatus === 'success' && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center justify-between text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Supabase Connected &amp; Ready!</span>
                  </div>
                  <button
                    onClick={handlePushData}
                    disabled={syncStatus === 'syncing'}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-500 cursor-pointer shadow-sm"
                  >
                    <RefreshCw className={`h-3 w-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                    {syncStatus === 'syncing' ? 'Pushing...' : 'Sync Local Data to Cloud'}
                  </button>
                </div>
              )}

              {syncStatus === 'success' && (
                <p className="text-xs text-emerald-400 font-medium">
                  ✓ Successfully synced {syncCount} transactions and categories to your Supabase PostgreSQL database!
                </p>
              )}

              {testStatus === 'error' && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-center gap-2 text-rose-300">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{testMessage}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  Run this SQL in Supabase <strong>SQL Editor</strong> to create tables &amp; RLS policies:
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy SQL
                    </>
                  )}
                </button>
              </div>

              <pre className="max-h-72 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 font-mono text-[11px] text-zinc-300 scrollbar-thin">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-2 flex items-center justify-between pt-3 border-t border-zinc-800 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-emerald-400" /> Row Level Security (RLS) enabled
          </span>
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-zinc-300 hover:bg-zinc-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
