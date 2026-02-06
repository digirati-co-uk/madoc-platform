---
name: auth-middleware
description: Work on Madoc TS auth-related middleware, request guards, and state setup. Use when changing parse/set JWT behavior, auth error handling, or middleware order in services/madoc-ts.
---

# Auth Middleware (Madoc TS)

## Goal
Document the auth middleware chain so changes to JWT parsing, cookie handling, and authorization errors are consistent.

## Scope
- JWT parsing and refresh logic
- JWT cookie issuance after authentication
- Auth-related error handling

## Non-scope
- Auth server implementation
- Frontend login UI
- Non-auth middleware behavior

## Key Entry Points
- `services/madoc-ts/src/middleware/parse-jwt.ts`
- `services/madoc-ts/src/middleware/set-jwt.ts`
- `services/madoc-ts/src/middleware/error-handler.ts`
- `services/madoc-ts/src/middleware/site-api.ts`
- `services/madoc-ts/src/utility/get-jwt-cookies.ts`
- `services/madoc-ts/src/utility/get-token.ts`

## Architecture Summary (Based on Source)
- `parse-jwt.ts` reads site-scoped cookies when a `slug` is present, refreshes expired tokens, and otherwise verifies Bearer tokens.
- `parse-jwt.ts` supports service tokens with user/site overrides via `x-madoc-*` headers.
- `set-jwt.ts` sets JWT cookies after authentication when an authenticated user exists but no JWT is in state.
- `error-handler.ts` maps auth errors and expired JWTs to `401` responses.

## Quick Start Workflow
1. Read `services/madoc-ts/src/middleware/parse-jwt.ts` to understand token sources and refresh behavior.
2. Inspect `services/madoc-ts/src/middleware/set-jwt.ts` for JWT cookie issuance after login.
3. Review `services/madoc-ts/src/middleware/error-handler.ts` to see how auth errors surface to clients.
4. Confirm how `siteManager` is instantiated in `services/madoc-ts/src/middleware/site-api.ts` if you touch token refresh logic.

## Common Tasks
- Adjust token refresh window or cookie handling
- Add new request header overrides for service tokens
- Update auth error responses

## Pitfalls
- Changing cookie names without updating both parse and set logic
- Forgetting to propagate `authenticatedUser` state before `set-jwt`
- Swallowing expired token errors and returning incorrect status codes

## Suggested Checks
- Site route request with a valid cookie
- Site route request with an expired cookie and refresh enabled
- API request with a Bearer token
