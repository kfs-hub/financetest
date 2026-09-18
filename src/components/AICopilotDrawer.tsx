'use client';

import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Zap,
  TrendingDown,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { FinancialContext } from '@/lib/gemini';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AICopilotProps {
  financialContext: FinancialContext;
  apiKey?: string;
}

export const AICopilot: React.FC<AICopilotProps> = ({ financialContext, apiKey }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `👋 Hello! I am your **AI Financial Copilot**. I have analyzed your spending telemetry, budget velocities, recurring subscriptions, and detected anomalies.\n\nHow can I help you optimize your finances today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedPrompts = [
    { label: 'Executive Summary', query: 'Generate an executive summary of my financial health and spending' },
    { label: 'Cut $200 / Month', query: 'Where can I cut $200 from my monthly burn with realistic actions?' },
    { label: 'Audit Subscriptions', query: 'Audit my recurring subscriptions and highlight potential waste' },
    { label: 'Explain Anomalies', query: 'Explain my flagged spending anomalies and why they exceeded baseline' },
  ];

  const handleSend = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          context: financialContext,
          userApiKey: apiKey,
        }),
      });

      const data = await res.json();
      const reply = data.answer || 'I could not process that query. Please try again.';

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: 'Encountered a connection error while consulting the financial model. Please retry.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format basic markdown-style text into nice HTML
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-emerald-400 text-sm mt-2 mb-1">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('- ')) {
            return (
              <li key={idx} className="ml-4 list-disc text-zinc-300">
                <span dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
              </li>
            );
          }
          if (/^\d+\.\s/.test(line)) {
            return (
              <p key={idx} className="ml-2 font-medium text-zinc-200 mt-1">
                <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
              </p>
            );
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }
          return (
            <p key={idx} className="text-zinc-300">
              <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
            </p>
          );
        })}
      </div>
    );
  };

  const formatInline = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-zinc-400 italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-zinc-800 text-emerald-400 px-1 py-0.5 rounded text-[11px] font-mono">$1</code>');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[500px] rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/40 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-zinc-950 shadow-md">
            <Bot className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">AI Financial Copilot</h3>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                Online
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Context-grounded advice based on your transactions &amp; cash flows
            </p>
          </div>
        </div>

        {/* Privacy badge */}
        <div className="flex items-center gap-1.5 rounded-full bg-zinc-800/80 px-2.5 py-1 text-[11px] text-zinc-300 border border-zinc-700/60">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>PII Masked</span>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="border-b border-zinc-800/60 bg-zinc-950/20 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] text-zinc-500 font-medium whitespace-nowrap">Suggestions:</span>
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.query)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-300 whitespace-nowrap transition"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m) => {
          const isAi = m.sender === 'assistant';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-2xl ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {isAi && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
              )}
              <div
                className={`rounded-2xl p-3.5 shadow-md ${
                  isAi
                    ? 'border border-zinc-800 bg-zinc-950/80 text-zinc-200'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isAi ? renderFormattedText(m.text) : <p>{m.text}</p>}
                <span className="mt-1.5 block text-[10px] text-zinc-400 text-right">
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-md mr-auto">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 text-zinc-400 text-xs flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Analyzing financial telemetry &amp; projections...
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="border-t border-zinc-800/80 bg-zinc-950/60 p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            id="input-copilot-query"
            type="text"
            placeholder="Ask anything (e.g., 'How much did I spend on dining?', 'Where can I save $200?')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
          <button
            id="btn-copilot-send"
            type="submit"
            disabled={!input.trim() || loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md hover:bg-emerald-500 disabled:opacity-40 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
