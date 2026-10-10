# Synapse — Company Brain (FalkorDB Track 3)

Interactive enterprise knowledge graph connecting people, services, architecture decisions, incidents, and documents — powered by FalkorDB + Gemini 1.5 Flash.

## What it does
- **Graph ontology**: Person / Team / Service / Decision / Incident / Document with rich relationships
- **Natural language copilot**: Ask blast-radius, ADR, or incident questions in plain English; get openCypher, traversal, and executive synthesis with attribution
- **Visual exploration**: Force-directed 2D graph with particle-flow links, semantic colors, and click-to-inspect
- **Sandbox guard**: If FalkorDB port 49188 is blocked, embedded mock graph keeps UI alive for previews

## Track 3 — Company Brain key focus
- **Knowledge from docs, tickets, chats in one graph**: `/docs/auth-runbook.md`, `/docs/ledger-spec.md`, `/docs/adr-101.md`, `/docs/incident-001.md`
- **Who owns what / who knows what**: `(:Person)-[:OWNS]->(:Service)` and `(:Person)-[:LEADS]->(:Team)`
- **Tracing decisions back to source**: `(:Decision)-[:AUTHORED_BY]->(:Person)` and `(:Decision)-[:AFFECTS]->(:Service)`
- **Keeping knowledge current**: `last_updated` on all Document nodes; seed is idempotent (`MERGE`)
- **Answers with clear sources**: Chat answers cite owners, ADRs, and incidents; telemetry shows Cypher query + hop count + latency

## Quick start
```bash
npm install
cp .env.example .env.local   # set FALKORDB_HOST, FALKORDB_PORT, FALKORDB_USERNAME=falkordb, FALKORDB_PASSWORD, GEMINI_API_KEY
npm run seed                 # populate FalkorDB `company_brain`
npm run dev                  # localhost:3000
npm run build                # production build
```

## Architecture
- **Backend**: `app/api/chat/route.ts` (App Router) — NL→Cypher via Gemini REST, self-correction, FalkorDB traversal, synthesis
- **Backend**: `app/api/seed/route.ts` — one-click HTTP seed
- **Client**: `app/page.tsx` split-screen dashboard (chat + GraphViewer)
- **Lib**: `lib/falkordb.ts` — dynamic env, sandbox fail-safe mock graph

## Hackathon submission
- Track: **03 Company Brain**
- Prize target: **M6 Mac Mini** (best company-brain agent)
- Side prizes: Best blog post (AirPods 5), Top 50 (t-shirt) — see `BLOG.md`
