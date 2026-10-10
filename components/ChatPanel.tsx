"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Zap, Shield, AlertTriangle, Sparkles, Send } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  meta?: { cypher?: string; latencyMs?: number; mock?: boolean; error?: string };
}

const SCENARIOS = [
  {
    id: 'blast',
    label: 'Blast Radius',
    icon: Zap,
    prompt: 'Blast Radius: If the Payment Gateway fails, who gets paged and what downstream systems break?',
  },
  {
    id: 'tribal',
    label: 'Tribal Knowledge',
    icon: Shield,
    prompt: 'Tribal Knowledge: Who decided to enforce JWT tokens and what services are affected?',
  },
  {
    id: 'forensics',
    label: 'Incident Forensics',
    icon: AlertTriangle,
    prompt: 'Incident Forensics: Who resolved the last critical ledger outage and what ADR was created?',
  },
];

function renderMarkdown(text: string) {
  let html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-electric px-1 py-0.5 rounded text-[11px] font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-3 list-disc text-slate-700">$1</li>');
  // Wrap list items in ul if any
  if (html.includes('<li')) {
    const lines = html.split('\n');
    const out: string[] = [];
    let inList = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('<li')) {
        if (!inList) { out.push(`<ul class="pl-3 space-y-0.5 my-1">`); inList = true; }
        out.push(line);
      } else {
        if (inList) { out.push(`</ul>`); inList = false; }
        out.push(line);
      }
    }
    if (inList) out.push(`</ul>`);
    html = out.join('\n');
  }
  return html;
}

export default function ChatPanel({
  onQuery,
  isLoading,
  messages,
  lastMeta,
}: {
  onQuery: (q: string) => void;
  isLoading: boolean;
  messages: Message[];
  lastMeta?: { cypher?: string; latencyMs?: number; mock?: boolean; error?: string };
}) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const submit = () => {
    if (!input.trim() || isLoading) return;
    onQuery(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-full glass rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200/70 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric to-azure flex items-center justify-center shadow-sm">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">Synapse Copilot</h2>
          <p className="text-[11px] text-slate-500 font-medium">FalkorDB Knowledge Graph · Gemini 1.5 Flash</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2 ${m.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm ${m.role === 'assistant' ? 'bg-gradient-to-br from-electric to-azure text-white' : 'bg-emerald text-white'}`}>
                {m.role === 'assistant' ? 'AI' : 'YO'}
              </div>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm border ${m.role === 'assistant' ? 'bg-white/90 text-slate-800 border-slate-200/60 rounded-tl-md' : 'bg-slate-900 text-white border-slate-800 rounded-tr-md'}`}>
                <div className={m.role === 'assistant' ? 'prose prose-sm max-w-none' : 'whitespace-pre-wrap'} dangerouslySetInnerHTML={{ __html: m.role === 'assistant' ? renderMarkdown(m.content) : m.content.replace(/</g, '&lt;').replace(/>/g, '&gt;') }} />
                {m.meta?.cypher && (
                  <div className="mt-2 text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 break-all">{m.meta.cypher}</div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-electric to-azure flex items-center justify-center text-[10px] font-bold text-white shadow-sm">AI</div>
            <div className="bg-white/90 border border-slate-200/60 rounded-2xl rounded-tl-md px-3.5 py-3 text-sm text-slate-500 shadow-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-electric animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-azure animate-bounce delay-75" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-bounce delay-150" />
              Traversing graph · synthesizing...
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-slate-200/70 bg-white/50">
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => onQuery(s.prompt)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-sm text-[11px] font-semibold text-slate-700 hover:border-electric hover:text-electric transition-colors whitespace-nowrap disabled:opacity-60"
              title={s.prompt}
            >
              <s.icon className="w-3.5 h-3.5 text-electric" />
              {s.label}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); submit(); }}
          className="flex gap-2 items-end"
        >
          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about blast radius, ADRs, incidents..."
              className="w-full rounded-xl bg-white border border-slate-200/80 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 focus:border-electric shadow-sm"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-xl bg-gradient-to-br from-electric to-azure text-white p-2.5 shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
