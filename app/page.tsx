"use client";

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import ChatPanel from '@/components/ChatPanel';
import GraphCanvas from '@/components/GraphCanvas';
import InspectorDrawer from '@/components/InspectorDrawer';
import type { GraphNode, GraphLink } from '@/components/GraphCanvas';

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
    <main className="min-h-screen bg-ink-50 text-slate-900">
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
          <button
            onClick={() => setDrawerOpen((s) => !s)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-sm text-slate-700 hover:text-electric transition"
          >
            Inspector {drawerOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 grid lg:grid-cols-[42%_1fr] gap-6 items-start">
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
            <GraphCanvas
              nodes={graphData.nodes}
              links={graphData.links}
              activeNodeId={activeNode}
              onNodeClick={(node: GraphNode) => {
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
          <InspectorDrawer
            open={drawerOpen}
            cypher={lastMeta.cypher}
            latencyMs={lastMeta.latencyMs}
            mock={lastMeta.mock}
            error={lastMeta.error}
          />
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
