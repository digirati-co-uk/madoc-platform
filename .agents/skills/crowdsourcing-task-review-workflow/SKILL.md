---
name: crowdsourcing-task-review-workflow
description: Understand and modify the full Madoc TS crowdsourcing contribution and review pipeline. Use when changing claim creation rules, crowdsourcing-task and crowdsourcing-review lifecycle behavior, reviewer assignment policy, or project settings that control submission/review flow in services/madoc-ts.
---

# Crowdsourcing Task & Review Workflow (Madoc TS)

## Goal
Provide a reliable map of how contribution tasks and review tasks are created, transitioned, and gated by project/template/site settings.

## Scope
- Claim preparation and task creation decisions
- Task hierarchy creation (project -> manifest/canvas -> user tasks)
- Contribution status transitions and review task creation
- Reviewer assignment, review actions, and merge flow
- Settings that materially affect task/review behavior

## Non-scope
- Generic queue infrastructure details unrelated to crowdsourcing task types
- Capture model editor UI implementation details
- Non-crowdsourcing task types

## Primary Entry Points
- Contribution task handler: `services/madoc-ts/src/gateway/tasks/crowdsourcing-task.ts`
- Review task handler: `services/madoc-ts/src/gateway/tasks/crowdsourcing-review.ts`
- Claim routes: `services/madoc-ts/src/routes/projects/create-resource-claim.ts`
- Claim status update: `services/madoc-ts/src/routes/projects/update-resource-claim.ts`
- Reviewer assignment policy: `services/madoc-ts/src/routes/projects/assign-review.ts`
- Revision-task update guard: `services/madoc-ts/src/routes/projects/update-revision-task.ts`
- Claim gating helper: `services/madoc-ts/src/utility/claim-utilities.ts`
- Review action APIs: `services/madoc-ts/src/extensions/capture-models/crowdsourcing-api.ts`
- Project config schema: `services/madoc-ts/src/types/schemas/project-configuration.ts`

## Read This Next
- Deep pipeline + setting map: `references/pipeline-and-settings.md`

## Fast Mental Model
1. A user starts by preparing/creating a resource claim.
2. The claim route ensures task structure exists for project/manifest/canvas, then decides whether user can claim.
3. A `crowdsourcing-task` is created or reused and tied to a capture-model revision.
4. When the user submits (`status = 2`), a `crowdsourcing-review` task is created/reused.
5. Reviewer actions update revisions and push the user task to accepted/rejected/changes requested.
6. Parent manifest/canvas tasks and review tasks are synchronized based on subtask completion.

## Lifecycle Anchors
- `crowdsourcing-task` events: `madoc-ts.status.-1`, `.2`, `.3`, `.4`, plus assignment notifications.
- `crowdsourcing-review` events: `madoc-ts.created`, `.assigned`, `.status.3`.

## Critical Decision Points
- Claim allowed vs denied: `canUserClaimResource(...)` + project settings + existing subtasks.
- Manifest-vs-canvas contribution model: `claimGranularity` and `shadow.showCaptureModelOnManifest`.
- Review creation on submission: first submit creates review task, subsequent submits reuse existing active review.
- Reviewer selection: random reviewer, manual reviewer, or admin fallback.

## Settings With Real Runtime Effect
Treat these as first-class when debugging behavior:
- `claimGranularity`
- `maxContributionsPerResource`
- `revisionApprovalsRequired`
- `contributionWarningTime`
- `randomlyAssignReviewer`
- `manuallyAssignedReviewer`
- `adminsAreReviewers`
- `modelPageOptions.preventContributionAfterRejection`
- `modelPageOptions.preventContributionAfterSubmission`
- `modelPageOptions.preventMultipleUserSubmissionsPerResource`
- `modelPageOptions.preventContributionAfterManifestUnassign`
- `allowSubmissionsWhenCanvasComplete`
- `shadow.showCaptureModelOnManifest`
- `reviewOptions.allowMerging`
- `reviewOptions.enableAutoReview`

See `references/pipeline-and-settings.md` for each setting’s code path.

## Defined But Currently Not Wired
These appear in project-template types but are not currently enforced in the main runtime path:
- `ProjectTemplate.configuration.tasks.generateOnCreate`
- `ProjectTemplate.configuration.tasks.generateOnNewContent`
- `ProjectTemplate.hooks.onCreateReview`
- `ProjectTemplate.hooks.onAssignReview`

Do not assume they affect runtime unless you add explicit call sites.

## Suggested Debug Workflow
1. Start with the project config and claim input (`projectId`, `manifestId`, `canvasId`, `revisionId`, `status`).
2. Trace `prepareResourceClaim` and `createResourceClaim` for structure creation and gating.
3. Inspect the resulting `crowdsourcing-task` state (`revisionId`, `reviewTask`, `userManifestTask`).
4. Follow task event handlers (`status.2`, `status.3`, `status.4`, `status.-1`).
5. Trace review assignment (`assign-review.ts`) and review actions (`crowdsourcing-api.ts`).
6. Validate frontend gating in `use-canvas-user-tasks.ts` and `use-manifest-user-tasks.ts` if behavior looks inconsistent with backend.

## Pitfalls
- Confusing parent structural tasks (`crowdsourcing-manifest-task`, `crowdsourcing-canvas-task`) with user contribution tasks (`crowdsourcing-task`).
- Debugging claim failures without checking `canUserClaimResource` and `modelPageOptions` restrictions.
- Assuming each submission creates a new review task; the system reuses active review tasks.
- Ignoring manifest-mode behavior (`claimGranularity = manifest`) when diagnosing canvas claim issues.

## Suggested Checks
- Claim same resource twice with different `revisionId` and verify policy behavior.
- Submit a contribution (`status=2`) and verify review task create/reuse behavior.
- Approve/request-changes/reject and verify user task status and notifications.
- Verify reviewer assignment policy under random/manual/admin fallback settings.
