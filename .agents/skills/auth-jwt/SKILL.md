---
name: auth-jwt
description: Work on Madoc TS JWT parsing, verification, and service token behavior. Use when changing JWT payload handling, signature verification, or service JWT configuration in services/madoc-ts.
---

# Auth JWT (Madoc TS)

## Goal
Explain how JWTs are verified and parsed so changes to claims, service tokens, or verification stay consistent.

## Scope
- JWT verification via jose
- JWT parsing into application state
- Service JWT configuration

## Non-scope
- Auth provider login flow
- Middleware ordering beyond JWT handling
- Frontend auth UI

## Key Entry Points
- `services/madoc-ts/src/utility/verify-signed-token.ts`
- `services/madoc-ts/src/utility/parse-jwt.ts`
- `services/madoc-ts/src/utility/get-token.ts`
- `services/madoc-ts/service-jwts/madoc-ts.json`

## Architecture Summary (Based on Source)
- `verify-signed-token.ts` verifies RS256 JWTs via `jwtVerify`, with a fallback `compactVerify` for expired tokens when `ignoreExpired` is true.
- `parse-jwt.ts` builds application state from JWT claims and supports service tokens plus gateway-issued tokens.
- `service-jwts/madoc-ts.json` defines scope and service identity for Madoc TS service tokens.

## Quick Start Workflow
1. Read `services/madoc-ts/src/utility/verify-signed-token.ts` to understand verification and expiry handling.
2. Inspect `services/madoc-ts/src/utility/parse-jwt.ts` for how claims map into `ApplicationState`.
3. Review `services/madoc-ts/service-jwts/madoc-ts.json` for service token scope and identity.

## Common Tasks
- Add or change JWT claim handling
- Adjust verification behavior or tolerated clock drift
- Update service token scope

## Pitfalls
- Modifying claim parsing without updating consumers of `ApplicationState`
- Treating service tokens as user tokens without `x-madoc-*` overrides
- Changing token verification algorithms without key updates

## Suggested Checks
- Verify a valid JWT against the current public key
- Parse a service token and confirm scope handling
- Validate behavior for expired JWTs
