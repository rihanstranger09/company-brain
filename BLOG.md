# Blog Post: Building Synapse — Company Brain for FalkorDB Track 3

**Why company brain matters**
Most AI agents answer questions in isolation. They don't know who decided to enforce JWT tokens, which service depends on the ledger, or who resolved the last critical outage. Synapse puts all of that into one connected graph so the agent can follow relationships instead of guessing.

**The graph model**
We built `company_brain` with nodes for People, Teams, Services, Decisions, Incidents, and Documents — plus relationships like `OWNS`, `DEPENDS_ON`, `AUTHORED_BY`, and `IMPACTED`. This isn't a static dictionary; it's a living network where every answer traces back to owners, ADRs, and root causes.

**Agent design**
The copilot uses Gemini 1.5 Flash to translate questions into openCypher, executes against FalkorDB, and synthesizes responses with clear attribution. When the database is unreachable, a sandbox guard supplies embedded mock data so the demo never breaks.

**What we learned**
- Graph queries are the agent's reasoning engine — not just storage
- Source attribution (who authored this ADR, who resolved this incident) is essential for trust
- A beautiful UI (particle-flow graph, glass surfaces, ambient glows) makes complex data accessible

**Try it**: https://github.com/rihanstranger09/company-brain
