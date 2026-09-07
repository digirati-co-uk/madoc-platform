---
name: madoc-auth
description: Madoc login, token/cookie handling, and shared authorization semantics. Applies when diagnosing or changing identity or access policy; using an existing route scope guard alone does not need this skill.
---

# Madoc Auth

Flag changes to identity or access policy as elevated-care work.

## Trace the affected credential

- Auth process and providers: `src/auth-server.ts`, `src/auth/index.ts`, `src/auth/`
- Federated identity completion: `src/auth/utils/login-with-provider.ts`
- Cookie issuance after downstream login sets `authenticatedUser`: `src/middleware/set-jwt.ts`, `src/utility/get-jwt-cookies.ts`
- Cookie/bearer selection and refresh: `src/middleware/parse-jwt.ts`, `src/utility/get-token.ts`
- Signature verification and claim mapping: `src/utility/verify-signed-token.ts`, `src/utility/parse-jwt.ts`
- Final route policy: `src/utility/user-with-scope.ts`, `src/router.ts`
- Service identity configuration: `service-jwts/`

## Constraints

- Trace issuers and consumers together when changing claims or cookie names. Site cookies are selected by route slug; a valid cookie can take precedence over the bearer path.
- Keep signature verification separate from claim parsing. Expired-token verification is for the refresh path and still verifies the signature; it is not authorization to accept expired requests.
- Preserve the service-token restriction on `x-madoc-*` identity overrides in `src/utility/parse-jwt.ts`.
- Preserve provider configuration gating, signature algorithms, cookie flags, expiry checks, and the deliberate denied-scope `NotFound` contract in `AGENTS.md`.

## Verify

For the changed credential or guard, check an allowed request and the relevant invalid, expired, or wrong-site case. Rebuild/restart `auth` for provider-service changes and `server` for request middleware; shared helpers can affect both.
