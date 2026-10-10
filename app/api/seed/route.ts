import { NextRequest, NextResponse } from 'next/server';

const SEED_CYPHER = `
      // Teams
      MERGE (t1:Team {id:'t1', name:'Core Platform', domain:'Infrastructure'})
      MERGE (t2:Team {id:'t2', name:'Payments', domain:'Financial Services'})
      MERGE (t3:Team {id:'t3', name:'SecOps', domain:'Security'})
      MERGE (t4:Team {id:'t4', name:'Growth', domain:'Marketing & Growth'})

      // People
      MERGE (p1:Person {id:'p1', name:'Elena Vasquez', role:'VP Engineering', email:'elena@co.com', team:'t1'})
      MERGE (p2:Person {id:'p2', name:'Marcus Chen', role:'Platform Lead', email:'marcus@co.com', team:'t1'})
      MERGE (p3:Person {id:'p3', name:'Sofia Alvarez', role:'Staff Engineer', email:'sofia@co.com', team:'t2'})
      MERGE (p4:Person {id:'p4', name:'David Okonkwo', role:'Senior SRE', email:'david@co.com', team:'t2'})
      MERGE (p5:Person {id:'p5', name:'Aisha Patel', role:'Security Architect', email:'aisha@co.com', team:'t3'})
      MERGE (p6:Person {id:'p6', name:'Leo Fischer', role:'Growth Engineer', email:'leo@co.com', team:'t4'})
      MERGE (p7:Person {id:'p7', name:'Nina Park', role:'Tech Lead', email:'nina@co.com', team:'t1'})
      MERGE (p8:Person {id:'p8', name:'Jonas Weber', role:'Incident Commander', email:'jonas@co.com', team:'t3'})

      // Services
      MERGE (s1:Service {id:'auth-service', name:'Auth Service', repo:'github.com/co/auth-service', tier:'critical', status:'healthy'})
      MERGE (s2:Service {id:'ledger-api', name:'Ledger API', repo:'github.com/co/ledger-api', tier:'critical', status:'healthy'})
      MERGE (s3:Service {id:'payment-gateway', name:'Payment Gateway', repo:'github.com/co/payment-gateway', tier:'critical', status:'degraded'})
      MERGE (s4:Service {id:'risk-engine', name:'Risk Engine', repo:'github.com/co/risk-engine', tier:'high', status:'healthy'})
      MERGE (s5:Service {id:'notification-worker', name:'Notification Worker', repo:'github.com/co/notification-worker', tier:'standard', status:'healthy'})
      MERGE (s6:Service {id:'user-db', name:'User DB', repo:'github.com/co/user-db', tier:'critical', status:'healthy'})

      // Decisions (ADRs)
      MERGE (d1:Decision {id:'ADR-101', title:'Deprecate static API keys for short-lived JWTs', status:'implemented', summary:'Replace long-lived static keys with JWT-based auth for all internal services.', rationale:'Reduce blast radius of credential leaks and enable fine-grained revocation.', date:'2025-03-12'})
      MERGE (d2:Decision {id:'ADR-102', title:'Event-driven Kafka ledger writes', status:'implemented', summary:'Write ledger events to Kafka before persisting to DB to improve durability.', rationale:'Guarantee at-least-once delivery and decouple writers from storage.', date:'2025-05-20'})
      MERGE (d3:Decision {id:'ADR-103', title:'Use sidecars for rate-limiting', status:'proposed', summary:'Deploy Envoy sidecars to enforce per-service rate limits.', rationale:'Prevent cascade failures during traffic spikes.', date:'2026-08-01'})
      MERGE (d4:Decision {id:'ADR-104', title:'Multi-region active-active payments', status:'implemented', summary:'Run payment gateway in EU and US with cross-region failover.', rationale:'Meet 99.99% SLA for financial transactions.', date:'2025-11-04'})
      MERGE (d5:Decision {id:'ADR-105', title:'Enforce zero-trust mTLS', status:'implemented', summary:'Require mutual TLS between all service meshes.', rationale:'Prevent lateral movement in case of single-service compromise.', date:'2026-01-15'})

      // Incidents
      MERGE (i1:Incident {id:'INC-001', title:'Critical Ledger Outage', severity:'P1', root_cause:'Replica lag caused by unoptimized read query on leader node.', resolved_at:'2025-07-14'})
      MERGE (i2:Incident {id:'INC-002', title:'Payment Gateway Degradation', severity:'P2', root_cause:'Upstream risk-engine timeout propagated to gateway thread pool.', resolved_at:'2026-02-20'})
      MERGE (i3:Incident {id:'INC-003', title:'Auth Service JWT Rotation Failure', severity:'P1', root_cause:'Clock skew prevented token refresh across regions.', resolved_at:'2025-09-10'})
      MERGE (i4:Incident {id:'INC-004', title:'Notification Worker Backlog', severity:'P2', root_cause:'Third-party SMS provider rate limit hit during campaign.', resolved_at:'2026-06-01'})

      // Documents
      MERGE (doc1:Document {id:'doc-1', title:'Auth Service Runbook', doc_type:'runbook', url:'/docs/auth-runbook'})
      MERGE (doc2:Document {id:'doc-2', title:'Ledger API Spec', doc_type:'spec', url:'/docs/ledger-spec'})
      MERGE (doc3:Document {id:'doc-3', title:'Payment Gateway Architecture', doc_type:'arch', url:'/docs/payment-arch'})
      MERGE (doc4:Document {id:'doc-4', title:'Incident Post-Mortem Template', doc_type:'template', url:'/docs/postmortem'})

      // Relationships: People -> Team (LEADS / MEMBER_OF)
      MERGE (p1)-[:LEADS]->(t1)
      MERGE (p2)-[:MEMBER_OF]->(t1)
      MERGE (p3)-[:MEMBER_OF]->(t2)
      MERGE (p4)-[:LEADS]->(t2)
      MERGE (p5)-[:LEADS]->(t3)
      MERGE (p6)-[:MEMBER_OF]->(t4)
      MERGE (p7)-[:LEADS]->(t1)
      MERGE (p8)-[:MEMBER_OF]->(t3)

      // Relationships: Person -> Service (OWNS)
      MERGE (p1)-[:OWNS]->(s1)
      MERGE (p2)-[:OWNS]->(s2)
      MERGE (p3)-[:OWNS]->(s3)
      MERGE (p4)-[:OWNS]->(s4)
      MERGE (p5)-[:OWNS]->(s6)
      MERGE (p6)-[:OWNS]->(s5)
      MERGE (p7)-[:OWNS]->(s1)
      MERGE (p8)-[:OWNS]->(s2)

      // Decisions -> Authored_by Person
      MERGE (d1)-[:AUTHORED_BY]->(p1)
      MERGE (d2)-[:AUTHORED_BY]->(p2)
      MERGE (d3)-[:AUTHORED_BY]->(p7)
      MERGE (d4)-[:AUTHORED_BY]->(p3)
      MERGE (d5)-[:AUTHORED_BY]->(p5)

      // Decisions -> Affects Service
      MERGE (d1)-[:AFFECTS]->(s1)
      MERGE (d2)-[:AFFECTS]->(s2)
      MERGE (d3)-[:AFFECTS]->(s3)
      MERGE (d4)-[:AFFECTS]->(s3)
      MERGE (d5)-[:AFFECTS]->(s1)

      // Service Dependencies
      MERGE (s3)-[:DEPENDS_ON]->(s2)
      MERGE (s2)-[:DEPENDS_ON]->(s6)
      MERGE (s3)-[:DEPENDS_ON]->(s4)
      MERGE (s1)-[:DEPENDS_ON]->(s6)
      MERGE (s5)-[:DEPENDS_ON]->(s2)

      // Incidents -> Impacted Services
      MERGE (i1)-[:IMPACTED]->(s2)
      MERGE (i2)-[:IMPACTED]->(s3)
      MERGE (i3)-[:IMPACTED]->(s1)
      MERGE (i4)-[:IMPACTED]->(s5)

      // Incidents -> Resolved By Person
      MERGE (i1)-[:RESOLVED_BY]->(p2)
      MERGE (i2)-[:RESOLVED_BY]->(p3)
      MERGE (i3)-[:RESOLVED_BY]->(p7)
      MERGE (i4)-[:RESOLVED_BY]->(p6)

      // Documents -> Documents Service
      MERGE (doc1)-[:DOCUMENTS]->(s1)
      MERGE (doc2)-[:DOCUMENTS]->(s2)
      MERGE (doc3)-[:DOCUMENTS]->(s3)
      MERGE (doc4)-[:DOCUMENTS]->(s2)
`;

export async function GET(req: NextRequest) {
  try {
    const host = (process.env.FALKORDB_HOST || '').trim();
    const port = Number(String(process.env.FALKORDB_PORT || '49188').trim());
    const username = (process.env.FALKORDB_USERNAME || 'falkordb').trim();
    const password = (process.env.FALKORDB_PASSWORD || '').trim();

    // Dynamic import to avoid build-time side effects / BigInt issues with the falkordb module
    const { FalkorDB } = await import('falkordb');
    const client = await FalkorDB.connect({
      host: host || 'localhost',
      port: port || 49188,
      username,
      password: password || undefined,
      socket: { tls: false, connectTimeout: 5000 },
    });

    const graph = client.selectGraph('company_brain');
    await graph.query(SEED_CYPHER, { TIMEOUT: 10000 } as any);

    // Count total nodes in graph after seed
    const countResult = await graph.query('MATCH (n) RETURN count(n) AS total', { TIMEOUT: 5000 } as any) as any;
    let seededNodes = 0;
    if (countResult?.data && Array.isArray(countResult.data) && countResult.data.length > 0) {
      const firstRow = countResult.data[0];
      if (Array.isArray(firstRow) && firstRow.length > 0) {
        seededNodes = parseInt(String(firstRow[0])) || 0;
      }
    }

    return NextResponse.json({ success: true, seededNodes });
  } catch (e: any) {
    console.error('[seed route] Error:', e);
    return NextResponse.json({ success: false, error: e.message || String(e) }, { status: 500 });
  }
}
