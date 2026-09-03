---
name: madoc-crowdsourcing
description: Trace or modify the Madoc TS contribution, claim, submission, review, reviewer-assignment, and approval workflow. Use when changing crowdsourcing task states, claim policy, revision review behavior, review bots, or project settings that govern the contribution lifecycle in services/madoc-ts.
---

# Madoc Crowdsourcing

This workflow crosses routes, task handlers, capture-model revisions, automation, and frontend policy. Read `references/workflow.md` for lifecycle or setting changes; a local one-function fix only needs the relevant source and callers.

## Primary entrypoints

- Claim creation and gating: `src/routes/projects/create-resource-claim.ts`, `src/utility/claim-utilities.ts`
- Claim updates: `src/routes/projects/update-resource-claim.ts`
- Contribution handler: `src/gateway/tasks/crowdsourcing-task.ts`
- Review handler and assignment: `src/gateway/tasks/crowdsourcing-review.ts`, `src/routes/projects/assign-review.ts`
- Review actions: `src/extensions/capture-models/crowdsourcing-api.ts`
- Revision-task guard: `src/routes/projects/update-revision-task.ts`
- Runtime configuration: `src/types/schemas/project-configuration.ts`

## Debug in this order

1. Record project settings and the claim target (`projectId`, `manifestId`, `canvasId`, `revisionId`).
2. Trace claim structure creation and `canUserClaimResource`.
3. Inspect contribution task state, especially `revisionId`, `reviewTask`, and parent-task links.
4. Follow the exact task status event and review assignment/action.
5. Check frontend gating only after confirming backend state and policy.

## Guardrails

- Distinguish structural project/manifest/canvas tasks from user contribution tasks.
- Preserve task status and `status_text` transitions; the UI and automation consume them.
- Re-submission normally reuses an active review task.
- Verify configuration fields have runtime call sites; template types contain options and hooks that are not wired.
- Keep unresolved tabular flags on the human-review path.

## Check

For lifecycle changes, cover claim, submit, assign, and the affected approve/reject/request-changes transition with one focused regression test where practical.
