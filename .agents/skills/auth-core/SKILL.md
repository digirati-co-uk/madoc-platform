---
name: auth-core
description: Work on Madoc TS auth server, Passport-based auth strategies, and login provider flow. Use when adding auth providers, changing login behavior, or updating auth server verification logic in services/madoc-ts.
---

# Auth Core (Madoc TS)

## Goal
Describe the auth server and provider strategy flow so new auth providers and login behavior can be added safely.

## Scope
- Auth server verification endpoint
- Passport strategy registration and routes
- Provider login flow and user lookup

## Non-scope
- Frontend login UI
- General middleware ordering outside auth
- JWT parsing details beyond verification

## Key Entry Points
- `services/madoc-ts/src/auth-server.ts`
- `services/madoc-ts/src/auth/index.ts`
- `services/madoc-ts/src/auth/github.ts`
- `services/madoc-ts/src/auth/utils/login-with-provider.ts`
- `services/madoc-ts/src/auth/README.md`

## Architecture Summary (Based on Source)
- `auth-server.ts` is a small HTTP service that accepts POST requests and verifies Bearer tokens via `verifySignedToken`.
- Auth providers are registered in `auth/index.ts` by adding strategy modules to the `strategies` array and merging their routers.
- The GitHub provider uses Passport GitHub strategy, fetches user emails, then maps a verified primary email to the internal auth user object.
- `login-with-provider.ts` checks federated login IDs in the database, sets `authenticatedUser` in state, and redirects.

## Quick Start Workflow
1. Read `services/madoc-ts/src/auth/index.ts` to see how providers are registered.
2. Inspect `services/madoc-ts/src/auth/github.ts` for a concrete provider pattern.
3. Review `services/madoc-ts/src/auth/utils/login-with-provider.ts` for user lookup and JWT-cookie flow integration.
4. If modifying token verification, read `services/madoc-ts/src/auth-server.ts` and `services/madoc-ts/src/utility/verify-signed-token.ts`.

## Common Tasks
- Add a new Passport provider strategy
- Adjust login redirect or federated user lookup
- Update auth server token verification behavior

## Pitfalls
- Registering a provider without adding it to `strategies` in `auth/index.ts`
- Missing verified email selection for providers with multiple emails
- Changing auth server behavior without matching client expectations

## Suggested Checks
- Auth server POST with a valid token
- Provider login flow (auth and callback)
- Federated login lookup for an existing user
