"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full text-slate-400 text-sm">Loading neural engine...</div>
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

export default function GraphViewer({
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        setDims({ width: Math.max(w, 300), height: Math.max(h, 300) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const graphData = useMemo(() => ({ nodes, links }), [nodes, links]);

  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      fgRef.current.zoomToFit(400, 50);
    }
  }, [graphData]);

  return (
    <div ref={containerRef} className="relative w-full h-full rounded-2xl overflow-hidden glass shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <ForceGraph2D
        ref={fgRef}
        width={dims.width}
        height={dims.height}
        graphData={graphData}
        nodeId="id"
        nodeLabel="label"
        nodeColor={(n: any) => {
          if (n.group === 'Service') return '#3B82F6';
          if (n.group === 'Person') return '#10B981';
          if (n.group === 'Decision') return '#F59E0B';
          if (n.group === 'Incident') return '#EF4444';
          return '#6366F1';
        }}
        nodeRelSize={8}
        nodeVal={(n: any) => (n.group === 'decision' || n.group === 'incident' || n.group === 'team' ? 10 : 6)}
        linkColor={() => '#CBD5E1'}
        linkWidth={1.5}
        linkCurvature={0.15}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkDirectionalParticles={4}
        linkDirectionalParticleSpeed={0.006}
        linkDirectionalParticleWidth={2.5}
        linkDirectionalParticleColor={() => '#6366F1'}
        backgroundColor="#F8FAFC"
        onNodeClick={(node: any) => onNodeClick?.(node)}
      />
      <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-semibold text-slate-700 shadow-sm border border-slate-200/70">
        {nodes.length} nodes · {links.length} links · Living Network
      </div>
      {activeNodeId && (
        <div className="absolute bottom-3 right-3 bg-gradient-to-r from-electric to-azure text-white px-3 py-2 rounded-xl text-xs shadow-xl backdrop-blur-md animate-pulse">
          Active: <span className="font-bold">{nodes.find((n) => n.id === activeNodeId)?.label || activeNodeId}</span>
        </div>
      )}
    </div>
  );
}
