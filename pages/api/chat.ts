import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SCHEMA_PROMPT = `You are an openCypher generator for a FalkorDB graph called company_brain.
Ontology:
- (:Person {id, name, role, email, team})
- (:Team {id, name, domain})
- (:Service {id, name, repo, tier, status})
- (:Decision {id, title, status, summary, rationale, date})
- (:Incident {id, title, severity, root_cause, resolved_at})
- (:Document {id, title, doc_type, url})
Relationships: (:Person)-[:LEADS|MEMBER_OF]->(:Team), (:Person)-[:OWNS]->(:Service), (:Decision)-[:AUTHORED_BY]->(:Person), (:Decision)-[:AFFECTS]->(:Service), (:Service)-[:DEPENDS_ON]->(:Service), (:Incident)-[:IMPACTED]->(:Service), (:Incident)-[:RESOLVED_BY]->(:Person), (:Document)-[:DOCUMENTS]->(:Service).
Constraints: ONLY generate valid, read-only openCypher (MATCH ... RETURN ...). Do NOT use APOC. Return ONLY the Cypher statement, no markdown, no explanation.`;

const SYNTHESIS_PROMPT = `You are an executive knowledge synthesis engine. Given traversal results and metadata, produce a concise executive explanation with these sections:
- Direct Answer (with multi-hop chain if relevant)
- Affected Owners & Teams
- Related ADRs / Decisions
- Incident / Post-mortem context
- Telemetry (cypher, node hop count, latency)
Be precise, cite node names/ids, and stay factual based solely on provided data.`;

async function generateContent(prompt: string, temperature = 0.2, maxTokens = 512) {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) throw new Error('GEMINI_API_KEY missing');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  return responseText || '';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const start = Date.now();
  try {
    const userQuery = req.body?.query || '';

    // 1. Generate openCypher
    let cypher = await generateContent(
      `${SCHEMA_PROMPT}\n\nUser question: ${userQuery}\nGenerate openCypher:`,
      0.2,
      512
    );
    cypher = cypher.replace(/```(?:cypher)?/gi, '').replace(/```/gi, '').trim();
    cypher = cypher.split('\n').filter((l: string) => l.trim() && !l.trim().startsWith('--')).join(' ');
    if (!cypher.toUpperCase().includes('MATCH')) {
      cypher = `MATCH (n) WHERE n.id IS NOT NULL RETURN n LIMIT 10`;
    }

    // Dynamically import to avoid build-time side effects from falkordb
    const { queryGraph } = await import('@/lib/falkordb');

    // 2. Execute with self-correction loop
    let result = await queryGraph(cypher);
    if (result.error && !result.mock && !/timeout/i.test(result.error || '')) {
      const fixed = await generateContent(
        `The following openCypher query has a syntax error: "${cypher}". Error: ${result.error}. Provide ONLY the corrected openCypher statement (read-only MATCH ... RETURN ...), with no extra text.`,
        0.1,
        256
      );
      const cleaned = fixed.replace(/```(?:cypher)?/gi, '').replace(/```/gi, '').trim();
      if (cleaned.toUpperCase().includes('MATCH')) {
        cypher = cleaned.split('\n').filter((l: string) => l.trim() && !l.trim().startsWith('--')).join(' ');
        result = await queryGraph(cypher);
      }
    }

    const graphData = {
      nodes: result.nodes.map((n: any) => ({ id: n.id, label: n.label, group: n.group, ...n.properties })),
      links: result.links.map((l: any) => ({ source: l.source, target: l.target, relation: l.relation })),
    };

    const nodesStr = JSON.stringify(graphData.nodes.slice(0, 25));
    const linksStr = JSON.stringify(graphData.links.slice(0, 25));
    const answer = await generateContent(
      `${SYNTHESIS_PROMPT}\n\nQuery: ${userQuery}\nCypher: ${cypher}\nResults (nodes): ${nodesStr}\nResults (links): ${linksStr}\nLatency: ${result.latencyMs}ms\nMock: ${result.mock}\nError (if any): ${result.error || 'none'}`,
      0.3,
      1024
    );

    return res.status(200).json({
      answer: answer || 'No synthesis generated.',
      cypher,
      latencyMs: result.latencyMs,
      graphData,
      mock: result.mock,
      error: result.error || null,
    });
  } catch (e: any) {
    console.error('[chat] Error:', e);
    return res.status(500).json({ error: 'Internal error', details: e.message || String(e) });
  }
}
