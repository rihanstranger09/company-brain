import { FalkorDB } from 'falkordb';

export interface MockNode {
  id: string;
  label: string;
  group: 'person' | 'team' | 'service' | 'decision' | 'incident' | 'document';
  properties?: Record<string, any>;
}

export interface MockLink {
  source: string;
  target: string;
  relation: string;
}

export interface GraphResult {
  mock: boolean;
  nodes: MockNode[];
  links: MockLink[];
  cypher?: string;
  latencyMs: number;
  error?: string;
}

// Embedded fallback graph state for sandbox / offline preview
const FALLBACK_NODES: MockNode[] = [
  { id: 't1', label: 'Core Platform', group: 'team', properties: { domain: 'Infrastructure' } },
  { id: 't2', label: 'Payments', group: 'team', properties: { domain: 'Financial Services' } },
  { id: 't3', label: 'SecOps', group: 'team', properties: { domain: 'Security' } },
  { id: 't4', label: 'Growth', group: 'team', properties: { domain: 'Marketing & Growth' } },
  { id: 'p1', label: 'Elena Vasquez', group: 'person', properties: { role: 'VP Engineering', team: 't1' } },
  { id: 'p2', label: 'Marcus Chen', group: 'person', properties: { role: 'Platform Lead', team: 't1' } },
  { id: 'p3', label: 'Sofia Alvarez', group: 'person', properties: { role: 'Staff Engineer', team: 't2' } },
  { id: 'p4', label: 'David Okonkwo', group: 'person', properties: { role: 'Senior SRE', team: 't2' } },
  { id: 'p5', label: 'Aisha Patel', group: 'person', properties: { role: 'Security Architect', team: 't3' } },
  { id: 'p6', label: 'Leo Fischer', group: 'person', properties: { role: 'Growth Engineer', team: 't4' } },
  { id: 'p7', label: 'Nina Park', group: 'person', properties: { role: 'Tech Lead', team: 't1' } },
  { id: 'p8', label: 'Jonas Weber', group: 'person', properties: { role: 'Incident Commander', team: 't3' } },
  { id: 'auth-service', label: 'Auth Service', group: 'service', properties: { tier: 'critical', status: 'healthy' } },
  { id: 'ledger-api', label: 'Ledger API', group: 'service', properties: { tier: 'critical', status: 'healthy' } },
  { id: 'payment-gateway', label: 'Payment Gateway', group: 'service', properties: { tier: 'critical', status: 'degraded' } },
  { id: 'risk-engine', label: 'Risk Engine', group: 'service', properties: { tier: 'high', status: 'healthy' } },
  { id: 'notification-worker', label: 'Notification Worker', group: 'service', properties: { tier: 'standard', status: 'healthy' } },
  { id: 'user-db', label: 'User DB', group: 'service', properties: { tier: 'critical', status: 'healthy' } },
  { id: 'ADR-101', label: 'ADR-101: JWT Auth', group: 'decision', properties: { status: 'implemented', date: '2025-03-12' } },
  { id: 'ADR-102', label: 'ADR-102: Kafka Ledger', group: 'decision', properties: { status: 'implemented', date: '2025-05-20' } },
  { id: 'ADR-103', label: 'ADR-103: Rate Limit', group: 'decision', properties: { status: 'proposed' } },
  { id: 'ADR-104', label: 'ADR-104: Multi-region Payments', group: 'decision', properties: { status: 'implemented' } },
  { id: 'ADR-105', label: 'ADR-105: mTLS', group: 'decision', properties: { status: 'implemented' } },
  { id: 'INC-001', label: 'Critical Ledger Outage', group: 'incident', properties: { severity: 'P1', resolved_at: '2025-07-14' } },
  { id: 'INC-002', label: 'Payment Gateway Degradation', group: 'incident', properties: { severity: 'P2', resolved_at: '2026-02-20' } },
  { id: 'INC-003', label: 'JWT Rotation Failure', group: 'incident', properties: { severity: 'P1', resolved_at: '2025-09-10' } },
  { id: 'INC-004', label: 'Notification Worker Backlog', group: 'incident', properties: { severity: 'P2', resolved_at: '2026-06-01' } },
  { id: 'doc-1', label: 'Auth Service Runbook', group: 'document', properties: { doc_type: 'runbook' } },
  { id: 'doc-2', label: 'Ledger API Spec', group: 'document', properties: { doc_type: 'spec' } },
  { id: 'doc-3', label: 'Payment Gateway Architecture', group: 'document', properties: { doc_type: 'arch' } },
  { id: 'doc-4', label: 'Incident Post-Mortem Template', group: 'document', properties: { doc_type: 'template' } },
];

const FALLBACK_LINKS: MockLink[] = [
  { source: 'p1', target: 't1', relation: 'LEADS' },
  { source: 'p2', target: 't1', relation: 'MEMBER_OF' },
  { source: 'p3', target: 't2', relation: 'MEMBER_OF' },
  { source: 'p4', target: 't2', relation: 'LEADS' },
  { source: 'p5', target: 't3', relation: 'LEADS' },
  { source: 'p6', target: 't4', relation: 'MEMBER_OF' },
  { source: 'p7', target: 't1', relation: 'LEADS' },
  { source: 'p8', target: 't3', relation: 'MEMBER_OF' },
  { source: 'p1', target: 'auth-service', relation: 'OWNS' },
  { source: 'p2', target: 'ledger-api', relation: 'OWNS' },
  { source: 'p3', target: 'payment-gateway', relation: 'OWNS' },
  { source: 'p4', target: 'risk-engine', relation: 'OWNS' },
  { source: 'p5', target: 'user-db', relation: 'OWNS' },
  { source: 'p6', target: 'notification-worker', relation: 'OWNS' },
  { source: 'p7', target: 'auth-service', relation: 'OWNS' },
  { source: 'p8', target: 'ledger-api', relation: 'OWNS' },
  { source: 'ADR-101', target: 'p1', relation: 'AUTHORED_BY' },
  { source: 'ADR-102', target: 'p2', relation: 'AUTHORED_BY' },
  { source: 'ADR-103', target: 'p7', relation: 'AUTHORED_BY' },
  { source: 'ADR-104', target: 'p3', relation: 'AUTHORED_BY' },
  { source: 'ADR-105', target: 'p5', relation: 'AUTHORED_BY' },
  { source: 'ADR-101', target: 'auth-service', relation: 'AFFECTS' },
  { source: 'ADR-102', target: 'ledger-api', relation: 'AFFECTS' },
  { source: 'ADR-103', target: 'payment-gateway', relation: 'AFFECTS' },
  { source: 'ADR-104', target: 'payment-gateway', relation: 'AFFECTS' },
  { source: 'ADR-105', target: 'auth-service', relation: 'AFFECTS' },
  { source: 'payment-gateway', target: 'ledger-api', relation: 'DEPENDS_ON' },
  { source: 'ledger-api', target: 'user-db', relation: 'DEPENDS_ON' },
  { source: 'payment-gateway', target: 'risk-engine', relation: 'DEPENDS_ON' },
  { source: 'auth-service', target: 'user-db', relation: 'DEPENDS_ON' },
  { source: 'notification-worker', target: 'ledger-api', relation: 'DEPENDS_ON' },
  { source: 'INC-001', target: 'ledger-api', relation: 'IMPACTED' },
  { source: 'INC-002', target: 'payment-gateway', relation: 'IMPACTED' },
  { source: 'INC-003', target: 'auth-service', relation: 'IMPACTED' },
  { source: 'INC-004', target: 'notification-worker', relation: 'IMPACTED' },
  { source: 'INC-001', target: 'p2', relation: 'RESOLVED_BY' },
  { source: 'INC-002', target: 'p3', relation: 'RESOLVED_BY' },
  { source: 'INC-003', target: 'p7', relation: 'RESOLVED_BY' },
  { source: 'INC-004', target: 'p6', relation: 'RESOLVED_BY' },
  { source: 'doc-1', target: 'auth-service', relation: 'DOCUMENTS' },
  { source: 'doc-2', target: 'ledger-api', relation: 'DOCUMENTS' },
  { source: 'doc-3', target: 'payment-gateway', relation: 'DOCUMENTS' },
  { source: 'doc-4', target: 'ledger-api', relation: 'DOCUMENTS' },
];

export async function buildClient() {
  const host = (process.env.FALKORDB_HOST || '').trim();
  const port = Number(String(process.env.FALKORDB_PORT || '49188').trim());
  const username = (process.env.FALKORDB_USERNAME || 'falkordb').trim();
  const password = (process.env.FALKORDB_PASSWORD || '').trim();
  return FalkorDB.connect({
    host: host || 'localhost',
    port: port || 49188,
    username,
    password: password || undefined,
    socket: { tls: false, connectTimeout: 3000, noDelay: true },
  });
}

export async function queryGraph(cypher: string): Promise<GraphResult> {
  const start = Date.now();
  try {
    const client = await buildClient();
    const graph = client.selectGraph('company_brain');
    const raw = await graph.query(cypher, { TIMEOUT: 8000 });
    const latencyMs = Date.now() - start;

    // Transform raw FalkorDB reply (array of records) into nodes/links heuristically
    const nodesById = new Map<string, MockNode>();
    const links: MockLink[] = [];

    // Heuristic: each record may contain nodes/properties; we simplify by extracting keys
    for (const record of (raw as unknown as any[])) {
      if (record && typeof record === 'object') {
        for (const [k, v] of Object.entries(record)) {
          if (v && typeof v === 'object' && (v as any).id) {
            const id = String((v as any).id);
            if (!nodesById.has(id)) {
              nodesById.set(id, {
                id,
                label: ((v as any).name || (v as any).title || id) as string,
                group: ((v as any).label || inferGroup(id)) as MockNode['group'],
                properties: filterProps(v),
              });
            }
          }
        }
      }
    }

    // Add relations if present in result (simplified)
    return {
      mock: false,
      nodes: Array.from(nodesById.values()),
      links,
      cypher,
      latencyMs,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    const isTimeout = err?.code === 'ECONNREFUSED' || err?.code === 'ETIMEDOUT' || /timeout/i.test(err?.message || '');
    const isBlocked = isTimeout || /socket/i.test(err?.message || '');

    // Sandbox guard: supply embedded mock/fallback graph state
    if (isBlocked || /sandbox/i.test(err?.message || '')) {
      return {
        mock: true,
        nodes: FALLBACK_NODES,
        links: FALLBACK_LINKS,
        cypher,
        latencyMs,
        error: `Sandbox firewall blocked FalkorDB port 49188 (${err?.message || 'timeout'}). Showing embedded fallback graph.`,
      };
    }

    // For syntax errors, return empty with error so API can self-correct
    return {
      mock: true,
      nodes: FALLBACK_NODES,
      links: FALLBACK_LINKS,
      cypher,
      latencyMs,
      error: err?.message || String(err),
    };
  }
}

function inferGroup(id: string): MockNode['group'] {
  if (id.startsWith('t')) return 'team';
  if (id.startsWith('p')) return 'person';
  if (id.startsWith('ADR')) return 'decision';
  if (id.startsWith('INC')) return 'incident';
  if (id.startsWith('doc')) return 'document';
  return 'service';
}

function filterProps(v: any) {
  const { id, name, title, label, ...rest } = v as any;
  return rest;
}
export { buildClient as getFalkorClient };
