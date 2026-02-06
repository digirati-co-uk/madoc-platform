# Manifest status inconsistency: manifest marked complete while canvases remain incomplete

## Summary
Manifest-level completion is currently derived from multiple inconsistent rules across task handlers and site endpoints. This can result in a manifest appearing complete even when canvases inside it are still incomplete.

## Affected files
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/gateway/tasks/crowdsourcing-task.ts`
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/routes/site/site-manifest-tasks.ts`
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/routes/site/site-canvas-tasks.ts`
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/routes/projects/assign-random-resource.ts`
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/gateway/tasks/crowdsourcing-manifest-task.ts`

## Findings

### 1) Parent manifest task can be set to complete by approvals only (without canvas structural completion)
In `crowdsourcing-task` `status.3` handling, parent `crowdsourcing-manifest-task` can be moved to status `3` when unique contributor count reaches `approvalsRequired`.

This does not verify that all canvas structural subtasks are complete.

Relevant lines:
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/gateway/tasks/crowdsourcing-task.ts:402`
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/gateway/tasks/crowdsourcing-task.ts:412`

### 2) Site endpoints conflate user-level completion with manifest-level completion
Both endpoints set `isManifestComplete` using:
- structural manifest task status, OR
- user’s manifest claim status.

This conflates personal completion with aggregate manifest completion.

Relevant lines:
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/routes/site/site-manifest-tasks.ts:143`
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/routes/site/site-canvas-tasks.ts:78`

### 3) Random assignment treats status `2` (`max contributors`) as effectively complete
Manifest selection excludes manifests with status `2` or `3`, reducing availability as if complete.

Relevant line:
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/routes/projects/assign-random-resource.ts:55`

### 4) Additional bug in collection-level completion condition
The condition in `crowdsourcing-manifest-task` completion path appears logically incorrect for mixed manifest/collection subjects.

Relevant lines:
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/gateway/tasks/crowdsourcing-manifest-task.ts:202`

## Proposed direction
1. Define canonical states explicitly:
- `structuralComplete` (all required children complete)
- `closedForContribution` (quota/policy reached)
- `userComplete` (current user has complete task)

2. Use structural completion as the only source for aggregate manifest completion.

3. Keep “max contributors reached” and review/quota states separate from completion.

4. Update random assignment to exclude only structurally complete manifests, not quota-closed manifests unless policy requires it.

## Acceptance criteria
- A manifest is marked complete only when required structural tasks are complete.
- UI receives distinct fields for aggregate vs user-specific completion.
- Random assignment behavior is deterministic and policy-driven, not overloaded by status code semantics.
- Add regression tests for:
  - incomplete canvases + manifest marked complete (must not happen)
  - user-complete vs manifest-complete distinction
  - status `2` behavior in random assignment

## Out of scope
- Full endpoint redesign for site task endpoints (covered in separate ticket).
