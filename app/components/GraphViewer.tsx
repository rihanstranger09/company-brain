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
          if (n.group === 'Service') return '#00A8E8';
          if (n.group === 'Person') return '#66BB6A';
          if (n.group === 'Decision') return '#FBAA60';
          if (n.group === 'Incident') return '#FF7A85';
          if (n.group === 'Team') return '#26C6DA';
          return '#7B92B2';
        }}
        nodeRelSize={9}
        nodeVal={9}
        linkColor={() => '#D1D5DB'}
        linkWidth={1.2}
        linkCurvature={0.08}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        linkDirectionalParticles={3}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => '#00A8E8'}
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
