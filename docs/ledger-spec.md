# Ledger API Specification (ADR-102)

**Status:** Implemented  
**Author:** Marcus Chen (Platform Lead)  
**Date:** 2025-05-20

## Architecture
Event-driven Kafka ledger writes replace synchronous SQL writes. Events written to Kafka before DB persistence guarantees at-least-once delivery.

## Dependency Chain
`payment-gateway` → `ledger-api` → `user-db`

## Incident Link
- **INC-001** (Critical Ledger Outage) resolved by Marcus Chen. Root cause: SQL leader replica lag.
- Prevention: ADR-102 eliminates direct DB contention.
