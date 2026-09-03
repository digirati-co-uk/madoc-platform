---
name: madoc-auth
description: Trace or modify Madoc TS authentication and authorization, including the auth service, Passport providers, federated login, JWT parsing and verification, cookies, service tokens, route guards, scopes, and auth error behavior in services/madoc-ts.
---

# Madoc Auth

Flag auth changes as elevated-care work. Preserve the repository's deliberate `NotFound` behavior for unauthorized or out-of-scope requests unless the task explicitly changes that contract.

## Source map

- Auth process: `src/auth-server.ts`, `entrypoint/auth.cjs`
- Provider registration and implementations: `src/auth/index.ts`, `src/auth/`
- Federated login completion: `src/auth/utils/login-with-provider.ts`
- Request middleware: `src/middleware/parse-jwt.ts`, `src/middleware/set-jwt.ts`
- Token utilities: `src/utility/verify-signed-token.ts`, `src/utility/parse-jwt.ts`, `src/utility/get-token.ts`, `src/utility/get-jwt-cookies.ts`
- Route-level policy: `src/router.ts`, `src/utility/user-with-scope.ts`
- Service identity: `service-jwts/`

## Trace the flow

1. Provider login registers through `src/auth/index.ts` and resolves the federated identity in `login-with-provider.ts`.
2. Successful login places `authenticatedUser` in state; `set-jwt.ts` issues the cookie.
3. `parse-jwt.ts` handles site cookies, refresh, bearer tokens, and service-token overrides, then populates request state.
4. `TypedRouter` and explicit scope helpers apply the final route policy.

## Guardrails

- Change token production, parsing, and consumers together when claims or cookie names move.
- Do not weaken signature algorithms, expiry checks, cookie flags, or scope checks for convenience.
- Trace every caller before changing shared verification or parsing helpers.
- Keep provider enablement conditional on its complete configuration.

## Check

Exercise the affected path: provider callback, valid and expired site cookie, bearer/service token, or protected route. Rebuild and restart `auth` for auth-service changes and `server` for request middleware or route-policy changes.
