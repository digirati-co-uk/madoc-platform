# Hardening: `createResourceClaim` claim/status logic

## Summary

`createResourceClaim` currently has several logic gaps that can allow invalid status transitions or ambiguous task updates. We are not fixing this now, but we should track and prioritize a hardening pass.

## Affected area

- `services/madoc-ts/src/routes/projects/create-resource-claim.ts`

## Findings to address

### 1) Missing runtime validation for `claim.status` (high)

- `claim.status` is treated as `0 | 1 | 2` by TypeScript but request bodies are untyped at runtime.
- The route forwards `claim.status` directly to `updateTask(...)` in multiple places.
- Risk: callers can submit terminal statuses (`3`, `-1`, etc.) and bypass normal review flow.

Relevant lines (as reviewed):

- around `:583`
- around `:635`
- around `:727`
- around `:780`

### 2) Existing-claim revision attach path can pass `status: undefined` (medium)

- In branches that attach `revisionId` to an existing claim, the payload still includes `status: claim.status` even when absent.
- Risk: undefined behavior depending on downstream update semantics.

Relevant lines (as reviewed):

- around `:583`
- around `:635`

### 3) Manifest-granularity policy check bypass when `userManifestTask` exists (medium)

- Policy check is skipped when `claimGranularity === 'manifest'` and a `userManifestTask` exists.
- This may be intentional, but should be explicitly documented or tightened to avoid edge-case bypasses for rejection/multi-submission policy.

Relevant line (as reviewed):

- around `:686`

## Proposed fix direction (future)

1. Add explicit runtime validation at route boundary:
   - allow only `status` in `{0,1,2}` for this endpoint.
2. Build `updateTask` payloads conditionally:
   - include `status` only if provided and valid.
3. Review manifest-mode bypass logic:
   - either enforce policy consistently via `canUserClaimResource(...)` or document intended exception with tests.

## Acceptance criteria

- Requests with invalid `status` values are rejected with 4xx.
- Existing-claim update paths never send `status: undefined`.
- Manifest-granularity behavior is explicitly defined and test-covered.
- No regression to current valid claim flows (canvas and manifest modes).

## Out of scope

- Broader workflow redesign.
- Changes to unrelated review-task handlers.
