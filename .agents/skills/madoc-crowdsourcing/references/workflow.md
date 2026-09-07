# Crowdsourcing workflow reference

Status definitions and handlers live in `src/gateway/tasks/crowdsourcing-task.ts` and `src/gateway/tasks/crowdsourcing-review.ts` (paths relative to `services/madoc-ts`).

## Task families

- `crowdsourcing-project`: project root.
- `crowdsourcing-manifest-task` and `crowdsourcing-canvas-task`: structural parents created when a claim needs them.
- `crowdsourcing-task`: one user's contribution linked to a capture-model revision.
- `crowdsourcing-review`: review work linked back to one or more contributions.

## Contribution states

| Status | Meaning | Typical transition |
| --- | --- | --- |
| `-1` | Rejected/unassigned | Review rejects or claim is removed |
| `0` | Not started | Task created |
| `1` | In progress | Contributor starts work |
| `2` | Submitted/in review | Contributor submits or resubmits |
| `3` | Accepted | Reviewer approves |
| `4` | Changes requested | Reviewer returns work |

## Review states

| Status | Meaning |
| --- | --- |
| `-1` | Rejected |
| `0` | Not started |
| `1` | Assigned/accepted |
| `2` | Reviewing |
| `3` | Done |
| `4` | Changes requested |
| `5` | Contributor submitted new changes |

Confirm meanings against neighbouring handlers before changing them; external task APIs also expose these numeric states.

## Runtime flow

1. Project creation creates the `crowdsourcing-project` root task.
2. Claim preparation creates missing manifest/canvas structural tasks and applies project policy.
3. Claim creation creates or reuses a `crowdsourcing-task` and capture-model revision.
4. Contribution status `2` creates or reuses a review and records the delegated relationship.
5. Assignment chooses an existing parent assignee, a random/manual reviewer, or an admin fallback.
6. Review actions update revisions and move the contribution to accepted, rejected, or changes requested.
7. Acceptance can complete related review and parent tasks, reindex resources, and emit notifications.

## Settings and consumers

Start at `src/types/schemas/project-configuration.ts` and search the affected field with `rg -n '<setting>' services/madoc-ts/src`. Claim policy spans `claimGranularity`, contribution limits, and `modelPageOptions`; review policy spans reviewer assignment, approval thresholds, and `reviewOptions`. Expiry runs through `src/cron/check-expired-manifests.ts`.

Check `shadow.showCaptureModelOnManifest` alongside `claimGranularity`: manifest-level capture changes both frontend navigation and submission handling. A setting's presence in schema or template defaults does not establish backend enforcement.

## Defined but not wired

At the time this reference was reviewed, these existed in project-template types/examples but had no core runtime call site:

- `configuration.tasks.generateOnCreate`
- `configuration.tasks.generateOnNewContent`
- `hooks.onCreateReview`
- `hooks.onAssignReview`

Re-run `rg` before relying on that absence.
