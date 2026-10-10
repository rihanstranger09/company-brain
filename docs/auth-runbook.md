# Auth Service Runbook

## Overview
The Auth Service (`auth-service`) manages JWT token issuance, validation, and rotation for all internal microservices. This runbook covers the post-ADR-101 architecture.

## On-Call Checklist
1. Monitor token validation failure rate in `auth-service` dashboards.
2. If failure rate > 0.5%, page **Carol Danvers** (Payments Lead) and **Alice Chen** (Staff Backend Eng).
3. Verify JWT signer clock sync — clock skew caused INC-003 (JWT Rotation Failure).
4. Check `user-db` connection pool — authentication depends on active user records.

## Decisions Referenced
- **ADR-101**: Deprecate static API keys for short-lived JWTs (status: implemented).
- **ADR-105**: Enforce zero-trust mTLS between all mesh services.

## Owners
- **Elena Vasquez** (VP Engineering, Core Platform) — strategic authority
- **Marcus Chen** (Platform Lead, Core Platform) — operational authority
