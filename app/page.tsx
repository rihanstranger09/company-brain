"use client";

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import ChatPanel from '@/components/ChatPanel';
import GraphViewer from '@/app/components/GraphViewer';
import SourcePanel from '@/app/components/SourcePanel';
import type { GraphNode, GraphLink } from '@/app/components/GraphViewer';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  meta?: { cypher?: string; latencyMs?: number; mock?: boolean; error?: string };
}

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to **Synapse** — your company brain. Ask about blast radius, ADRs, incidents, or team ownership. The graph is live against FalkorDB (with sandbox fallback if needed). Try one of the three judge scenarios.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
  const [lastMeta, setLastMeta] = useState<{ cypher?: string; latencyMs?: number; mock?: boolean; error?: string }>({});
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const handleQuery = useCallback(async (query: string) => {
    setIsLoading(true);
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();

      const meta = {
        cypher: data.cypher,
        latencyMs: data.latencyMs,
        mock: data.mock,
        error: data.error,
      };
      setLastMeta(meta);

      setGraphData({
        nodes: data.graphData?.nodes || [],
        links: data.graphData?.links || [],
      });

      const answerMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || 'No answer generated.',
        meta,
      };
      setMessages((prev) => [...prev, answerMsg]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error communicating with Copilot: ${e?.message || 'Unknown'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF7ED] via-[#FDF2F8] to-[#E0F2FE] text-slate-900 dot-grid ambient-glows">
      {/* Hero / Brand Header — Image-1 landing aesthetic */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFF7ED]/80 via-[#FCE7F3]/50 to-[#E0F2FE]/60" />
        <div className="relative max-w-[1600px] mx-auto px-6 md:px-10 py-10 md:py-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/50 shadow-sm text-[11px] font-bold text-slate-600 mb-4 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" /> FalkorDB Track 3 · Enterprise Knowledge Graph
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] text-gradient drop-shadow-sm">
              The new age of<br />
              <span className="italic font-serif">customer service</span><br />
              <span className="text-amber-600">is AI-first</span>
            </h1>
            <p className="mt-4 text-slate-600 text-base md:text-lg max-w-xl leading-relaxed font-light">
              Synapse connects engineering microservices, Architecture Decision Records, incident post-mortems, team ownership, and dependencies into an interactive knowledge graph powered by FalkorDB and Gemini 1.5 Flash.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a href="#graph-panel" className="px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition">View demo</a>
            <a href="#graph-panel" className="px-5 py-3 rounded-xl bg-white/70 backdrop-blur-md text-slate-900 border border-slate-200/80 text-sm font-semibold shadow-sm hover:bg-white transition">Start free trial</a>
          </div>
        </div>
      </header>
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-200/70 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric via-azure to-emerald flex items-center justify-center shadow-lg shadow-electric/20">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight leading-none">Synapse</h1>
            <p className="text-[11px] font-medium text-slate-500">Enterprise Company Brain · FalkorDB Track 3</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald/10 text-emerald border border-emerald/20">
            <Layers className="w-3 h-3" /> Graph Active
          </span>
          <button onClick={() => {}} className="hidden" />
        </div>
      </header>

      <div id="graph-panel" className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 grid lg:grid-cols-[42%_1fr] gap-6 items-start">
        {/* Left: Chat */}
        <section className="h-[calc(100vh-12rem)] min-h-[520px]">
          <ChatPanel
            onQuery={handleQuery}
            isLoading={isLoading}
            messages={messages}
            lastMeta={lastMeta}
          />
        </section>

        {/* Right: Graph */}
        <section className="h-[calc(100vh-12rem)] min-h-[520px] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Knowledge Graph</h2>
              <p className="text-xs text-slate-500">Force-directed traversal visualization with semantic color coding</p>
            </div>
            <div className="flex gap-2">
              {[
                { label: 'Team', color: '#4f46e5' },
                { label: 'Service', color: '#2563eb' },
                { label: 'Person', color: '#059669' },
                { label: 'Decision', color: '#d97706' },
                { label: 'Incident', color: '#e11d48' },
                { label: 'Doc', color: '#475569' },
              ].map((l) => (
                <span key={l.label} className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-white/60 px-1.5 py-0.5 rounded-md border border-slate-200/60 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <GraphViewer
              nodes={graphData.nodes}
              links={graphData.links}
              activeNodeId={activeNode}
              onNodeClick={(node: any) => {
                setActiveNode(node.id);
                // Append a contextual message
                setMessages((prev) => [
                  ...prev,
                  {
                    id: (Date.now()).toString(),
                    role: 'assistant',
                    content: `Node selected: **${node.label}** (${node.group}). Properties: ${JSON.stringify(node).slice(0, 200)}...`,
                  },
                ]);
              }}
            />
          </div>

          {/* Bottom Inspector */}
          <SourcePanel cypher={lastMeta.cypher} latencyMs={lastMeta.latencyMs} mock={lastMeta.mock} error={lastMeta.error} graphData={graphData} />
        </section>
      </div>

      {/* Footer */}
      <footer className="max-w-[1600px] mx-auto px-6 py-4 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-200/60">
        <span>Built for FalkorDB Hackathon Track 3 — Company Brain</span>
        <span>Sandbox guard active · Mock fallback enabled when port 49188 is unreachable</span>
      </footer>
    </main>
  );
}
