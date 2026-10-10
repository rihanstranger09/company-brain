"use client";

import React, { useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full text-slate-400 text-sm">Loading graph engine...</div>
  ),
});

export interface GraphNode {
  id: string;
  label: string;
  group: 'person' | 'team' | 'service' | 'decision' | 'incident' | 'document';
  [key: string]: any;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  relation: string;
}

const GROUP_COLORS: Record<string, string> = {
  person: '#059669',
  team: '#4f46e5',
  service: '#2563eb',
  decision: '#d97706',
  incident: '#e11d48',
  document: '#475569',
};

export default function GraphCanvas({
  nodes,
  links,
  activeNodeId,
  onNodeClick,
}: {
  nodes: GraphNode[];
  links: GraphLink[];
  activeNodeId?: string | null;
  onNodeClick?: (node: GraphNode) => void;
}) {
  const fgRef = useRef<any>(null);

  const graphData = useMemo(() => ({ nodes, links }), [nodes, links]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden glass">
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeId="id"
        nodeLabel="label"
        nodeColor={(n: any) => GROUP_COLORS[n.group || 'service'] || '#94a3b8'}
        nodeRelSize={6}
        nodeVal={(n: any) => (n.group === 'decision' || n.group === 'incident' ? 8 : 5)}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.05}
        linkColor={() => '#94a3b8'}
        linkWidth={1.2}
        backgroundColor="#f8fafc"
        onNodeClick={(node: any) => onNodeClick?.(node)}
        onEngineStop={() => {
          // optional: center view
        }}
      />
      <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-2 py-1 rounded-md text-[11px] font-medium text-slate-600 shadow-sm border border-slate-200/60">
        {nodes.length} nodes · {links.length} links
      </div>
      {activeNodeId && (
        <div className="absolute bottom-3 left-3 bg-electric/90 text-white px-3 py-2 rounded-xl text-xs shadow-lg backdrop-blur-md">
          Selected: <span className="font-semibold">{nodes.find((n) => n.id === activeNodeId)?.label || activeNodeId}</span>
        </div>
      )}
    </div>
  );
}
