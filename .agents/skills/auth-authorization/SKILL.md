---
name: auth-authorization
description: Trace or modify Madoc TS authentication and authorization. Use when working on login strategies, JWT parsing/verification, cookie handling, or route-level authorization in services/madoc-ts.
---

# Auth & Authorization (Madoc TS)

## Overview
Document how Madoc TS authenticates users, parses/verifies JWTs, and applies authorization in middleware and route handlers.

## Key Entry Points
- Auth server: `services/madoc-ts/src/auth-server.ts`
- Auth strategies: `services/madoc-ts/src/auth/index.ts`, `services/madoc-ts/src/auth/github.ts`
- Provider login flow: `services/madoc-ts/src/auth/utils/login-with-provider.ts`
- JWT parsing middleware: `services/madoc-ts/src/middleware/parse-jwt.ts`
- JWT cookie setter: `services/madoc-ts/src/middleware/set-jwt.ts`
- Token verification: `services/madoc-ts/src/utility/verify-signed-token.ts`

## Auth Flow Summary (Based on Source)
- Strategies are registered in `src/auth/index.ts` and exposed via `getAuthRoutes()`.
- GitHub auth uses `koa-passport` and `passport-github2` in `src/auth/github.ts`.
- GitHub strategy is enabled only if `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_CLIENT_CALLBACK_URL` are set.
- Provider login flow is handled by `loginWithProvider`, which:
  - Matches a federated login against the `user` table (`federated_logins` JSON column).
  - If a user is found, calls `context.siteManager.getVerifiedLogin` and sets `context.state.authenticatedUser`.
  - Redirects to `/` after successful login.
- JWT verification uses `verifySignedToken` (RS256, public key from `getPublicPem`).
- `parseJwt` middleware:
  - Reads JWT cookie for site slug routes (`/s/:slug/...`).
  - Refreshes expired tokens when possible via `context.siteManager.refreshExpiredToken` and sets new cookies.
  - For non-site routes, extracts token via `getToken()` and verifies it (normally gateway-verified but rechecked here).
  - Sets `context.state.jwt` and `context.state.user` when a token is valid.
  - Throws `NotAuthorized` if a non-site request lacks a valid token.
- `setJwt` middleware sets auth cookies for authenticated users when no JWT is present yet.

## Quick Start Workflow
1. Inspect `auth/index.ts` to see registered strategies and routes.
2. If adding a provider, implement a new strategy (patterned after `auth/github.ts`) and include it in `strategies`.
3. Follow `login-with-provider.ts` to see how federated login is linked to a user and how session cookies are set.
4. Trace `parse-jwt.ts` for cookie parsing, token refresh, and fallback token verification.
5. Confirm JWT verification details in `verify-signed-token.ts`.

## Common Tasks
- Add or update an auth provider
- Debug missing/invalid JWTs
- Adjust token refresh window or cookie naming
- Add authorization checks to a new route

## Pitfalls
- Strategy enabled without required env vars (throws at register)
- Tokens verified but user state not set (check `parse-jwt` control flow)
- Route missing auth guard (ensure middleware coverage)

## Suggested Checks
- Auth login flow success (provider callback and redirect)
- JWT verification success and `context.state.jwt` set
- Token refresh path works (expired cookie refreshes)
