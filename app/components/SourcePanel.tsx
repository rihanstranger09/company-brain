"use client";
import React from 'react';
import { Database, Clock, Zap } from 'lucide-react';

export default function SourcePanel({ cypher, latencyMs, mock, error, graphData }: { cypher?: string; latencyMs?: number; mock?: boolean; error?: string | null; graphData?: { nodes: any[]; links: any[] } }) {
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="glass rounded-2xl p-4 shadow-sm border border-slate-200/60">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-electric" />
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Execution Source</h3>
          <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${mock ? 'bg-rose/10 text-rose' : 'bg-emerald/10 text-emerald'}`}>
            {mock ? 'FALLBACK' : 'LIVE'}
          </span>
        </div>

        <div className="space-y-2 text-[11px] text-slate-600 font-medium">
          <div className="flex justify-between"><span>Graph</span> <span className="font-mono text-electric font-semibold">company_brain</span></div>
          <div className="flex justify-between"><span>Latency</span> <span className="font-mono text-amber font-bold">{latencyMs ?? 18} ms</span></div>
          <div className="flex justify-between"><span>Cypher hops</span> <span className="font-mono">{graphData?.links?.length ?? 0}</span></div>
          <div className="flex justify-between"><span>Nodes traversed</span> <span className="font-mono">{graphData?.nodes?.length ?? 0}</span></div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200/60">
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Generated Cypher</div>
          <pre className="font-mono text-[10px] text-slate-500 whitespace-pre-wrap break-all bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 leading-relaxed">{cypher || 'Waiting for query...'}</pre>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 shadow-sm border border-slate-200/60 flex-1 overflow-auto">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-amber" />
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Agent Path</h3>
        </div>
        <div className="text-[11px] text-slate-600 leading-relaxed space-y-2">
          <div className="flex gap-2"><span className="text-electric font-bold">1.</span> <span>Match <strong>Person</strong> → OWNS → <strong>Service</strong></span></div>
          <div className="flex gap-2"><span className="text-electric font-bold">2.</span> <span>Traverse <strong>DEPENDS_ON</strong> to downstream services</span></div>
          <div className="flex gap-2"><span className="text-electric font-bold">3.</span> <span>Follow <strong>IMPACTED</strong> → Incident → <strong>RESOLVED_BY</strong> Person</span></div>
          <div className="flex gap-2"><span className="text-electric font-bold">4.</span> <span>Trace <strong>AUTHORED_BY</strong> → Decision (ADR) affecting service</span></div>
        </div>
      </div>
    </div>
  );
}
