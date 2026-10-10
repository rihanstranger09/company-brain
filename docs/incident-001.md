# Incident Post-Mortem: INC-001 Critical Ledger Outage

**Severity:** P1  
**Resolved:** 2025-07-14  
**Resolver:** Marcus Chen (Platform Lead, Core Platform)

## Root Cause
Replica lag on leader node caused by unoptimized read query blocking write replication.

## Impact
- `ledger-api` down for 42 minutes
- `payment-gateway` degraded until failover activated
- `notification-worker` backlog from dependent events

## Action Items
- Created ADR-102 (Kafka ledger writes)
- Added read-replica isolation and query timeout enforcement
