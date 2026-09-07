---
name: madoc-crowdsourcing
description: Madoc claim eligibility, contribution submission, reviewer assignment, and approval transitions. Applies to lifecycle policy and its UI gating; generic queue mechanics belong to madoc-tasks.
---

# Madoc Crowdsourcing

Read [the workflow reference](references/workflow.md) for lifecycle or setting changes. A local fix needs only the affected source and callers.

## Trace the transition

Record the project settings and target (`projectId`, `manifestId`, `canvasId`, `revisionId`), then follow the affected part of the flow:

- Claim creation and eligibility: `src/routes/projects/create-resource-claim.ts`, `src/utility/claim-utilities.ts`
- Claim updates: `src/routes/projects/update-resource-claim.ts`
- Contribution events: `src/gateway/tasks/crowdsourcing-task.ts`
- Review events and assignment: `src/gateway/tasks/crowdsourcing-review.ts`, `src/routes/projects/assign-review.ts`
- Review actions: `src/extensions/capture-models/crowdsourcing-api.ts`
- Revision-task guard: `src/routes/projects/update-revision-task.ts`
- Configuration: `src/types/schemas/project-configuration.ts`

## Constraints

- Distinguish structural project/manifest/canvas tasks from user contributions. Follow `revisionId`, `reviewTask`, delegated and parent links before changing status handling.
- Re-submission normally reuses a review task. Contributions in states `0`, `1`, and `4` remain continuable; multiple-submission restrictions must not strand changes-requested work.
- Check backend policy and frontend gating together, including manifest claims and `/model` flows. A hidden button does not enforce eligibility.
- Trace settings to runtime consumers; template type declarations alone do not establish behavior.
- Preserve the unresolved-cell-flag check in `src/automation/bots/AutomaticReviewBot.ts` so flagged tabular submissions stay on the human-review path.

## Verify

Exercise the affected transition with its real project settings, including resubmission or denied eligibility where relevant. For a lifecycle change, cover claim, submit, assignment, and the changed review action in a focused regression check where practical.
