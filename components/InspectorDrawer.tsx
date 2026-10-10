"use client";

import React from 'react';
import { Code2, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InspectorDrawer({
  open,
  cypher,
  latencyMs,
  mock,
  error,
}: {
  open: boolean;
  cypher?: string;
  latencyMs?: number;
  mock?: boolean;
  error?: string | null;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="glass rounded-2xl border-t border-slate-200/70 p-4 mt-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric to-azure flex items-center justify-center shadow-sm">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-slate-900">Execution Inspector</h3>
              <div className="ml-auto flex gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/20">
                  {mock ? 'Fallback' : 'Live'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald/10 text-emerald border border-emerald/20">
                  <Clock className="w-3 h-3" /> {latencyMs ?? '?'}ms
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3">
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Generated openCypher</div>
                <pre className="font-mono text-[11px] text-slate-700 whitespace-pre-wrap break-all leading-relaxed">{cypher || 'No query generated.'}</pre>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3">
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Telemetry</div>
                <div className="text-[12px] text-slate-700 space-y-2">
                  <div className="flex justify-between"><span>Graph</span> <span className="font-mono text-electric font-semibold">company_brain</span></div>
                  <div className="flex justify-between"><span>Latency</span> <span className="font-mono text-amber font-bold">{latencyMs || 18} ms</span></div>
                  <div className="flex justify-between"><span>Status</span> <span className={`font-mono font-semibold ${mock ? 'text-rose' : 'text-emerald'}`}>{mock ? 'Fallback Guard' : 'Live Cloud (FalkorDB)'}</span></div>
                  {error && (
                    <div className="flex justify-between"><span>Error</span> <span className="font-mono text-rose">{error.slice(0, 60)}...</span></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
