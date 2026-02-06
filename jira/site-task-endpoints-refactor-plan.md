# Refactor plan (validated): `site-manifest-tasks.ts` and `site-canvas-tasks.ts`

## Validation outcome
The previous plan was directionally correct, but it would still allow long-term drift because it kept two endpoint-specific decision models.

For easiest frontend maintenance, we need one canonical workflow decision contract shared by both endpoints, with server-owned CTA and block logic.

## Why this change is required

### 1) Frontend policy duplication still exists
`use-manifest-user-tasks.ts` and `use-canvas-user-tasks.ts` still recompute policy from raw tasks + config (`preventContributionAfterRejection`, `preventContributionAfterSubmission`, `preventMultipleUserSubmissionsPerResource`, capacity checks, complete checks).

### 2) Endpoint semantics are mixed
`isManifestComplete` is overloaded between structural completion and user-completion semantics. This is the root of inconsistent UI behavior.

### 3) Drift has already happened
Observed mismatch in contributor/capacity logic between hooks and endpoints, plus conditional hook orchestration in canvas workflow. This is fragile and hard to reason about.

## Design goal
Backend returns a complete workflow decision for each subject so frontend renders directly from server decisions with minimal/no business logic.

## Scope
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/routes/site/site-manifest-tasks.ts`
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/routes/site/site-canvas-tasks.ts`
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/frontend/site/hooks/use-manifest-user-tasks.ts`
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/frontend/site/hooks/use-canvas-user-tasks.ts`
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/frontend/site/hooks/use-manifest-task.ts`
- Canvas/manifest blocks and pages currently combining these hooks.

## Canonical contract (shared by both endpoints)

```ts
type WorkflowSubjectType = 'manifest' | 'canvas';

type WorkflowBlockReason =
  | 'PROJECT_PAUSED'
  | 'SUBJECT_COMPLETE'
  | 'PARENT_COMPLETE'
  | 'CAPACITY_REACHED'
  | 'REQUIRES_MANIFEST_CLAIM'
  | 'MANIFEST_CLAIM_EXPIRED'
  | 'REJECTED_BLOCK'
  | 'SUBMISSION_BLOCK'
  | 'MULTI_SUBMISSION_BLOCK';

type WorkflowPrimaryAction =
  | 'NONE'
  | 'PREPARE'
  | 'CLAIM_MANIFEST'
  | 'CONTRIBUTE'
  | 'CONTINUE_SUBMISSION'
  | 'ADD_NEW_SUBMISSION'
  | 'VIEW_SUBMISSIONS';

interface WorkflowDecisionV2 {
  version: 2;
  subject: {
    type: WorkflowSubjectType;
    id: number;
    projectId: number;
    manifestId?: number;
    parentId?: number;
  };
  status: {
    subjectComplete: boolean;
    parentComplete: boolean;
    userHasInProgress: boolean;
    userHasInReview: boolean;
    userHasCompleted: boolean;
    userClaimExpired: boolean;
    readOnly: boolean;
  };
  capacity: {
    maxContributors?: number;
    contributorCount: number;
    approvalsRequired?: number;
  };
  permissions: {
    canClaimManifest: boolean;
    canClaimSubject: boolean;
    canSubmit: boolean;
    canContribute: boolean;
  };
  decision: {
    primaryAction: WorkflowPrimaryAction;
    blockReason?: WorkflowBlockReason;
    showCompletionMessage: boolean;
  };
  refs: {
    subjectTaskId?: string;
    parentTaskId?: string;
    userManifestTaskId?: string;
  };
  user: {
    tasks: Array<{ id: string; status: number; revisionId?: string }>;
    stats?: { done: number; progress: number };
  };
  diagnostics?: {
    invalidTaskCount: number;
  };
}
```

## Endpoint shape strategy
- Keep two routes for compatibility and caching:
  - `GET /.../manifest-tasks/:manifestId`
  - `GET /.../canvas-tasks/:canvasId`
- Return the same top-level `WorkflowDecisionV2` contract from both.
- Canvas route additionally includes a compact `manifestSummary` if canvas pages need parent-specific banners/stats without making a second manifest task call.

## Backend architecture
Create one shared backend workflow package used by both routes.

Suggested files:
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/routes/site/task-workflow/types.ts`
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/routes/site/task-workflow/loaders.ts`
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/routes/site/task-workflow/filter-invalid-tasks.ts`
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/routes/site/task-workflow/evaluator.ts`
- `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/routes/site/task-workflow/presenter.ts`

Design rules:
1. `loaders.ts`: gather raw project/config/task graph and normalize to one internal shape.
2. `filter-invalid-tasks.ts`: single implementation for revision/capture-model validity checks.
3. `evaluator.ts`: pure business rules only.
4. `presenter.ts`: stable API DTO projection.
5. Route files remain thin wrappers with no branching policy logic.

## Frontend architecture target
- Replace policy-heavy hooks with thin data hooks:
  - `useManifestWorkflow()`
  - `useCanvasWorkflow()`
- Keep compatibility wrappers temporarily:
  - `useManifestTask()`, `useManifestUserTasks()`, `useCanvasUserTasks()` map fields only.
- Remove endpoint-to-endpoint hook dependency in canvas path (no conditional manifest hook inside canvas hook).

## Migration plan

### Phase 0: Characterization
1. Add endpoint snapshot/integration tests for current behavior on key scenarios.
2. Capture current UI decisions for manifest and canvas pages to prevent accidental regressions.

### Phase 1: Shared evaluator (no API change yet)
1. Implement `task-workflow/*` package.
2. Add evaluator unit tests across config/task matrix.
3. Keep route output unchanged while dual-running evaluator in tests.

### Phase 2: V2 additive contracts
1. Add `workflowV2` payload to both endpoints.
2. Keep legacy fields (`isManifestComplete`, `canUserSubmit`, etc.) temporarily.
3. Add diagnostics counters and mismatch logs during migration.

### Phase 3: Frontend switch
1. Update hooks/components to consume `workflowV2`.
2. Remove frontend policy recomputation.
3. Consolidate canvas page so it does not need separate manifest task query for workflow decisions.

### Phase 4: Cleanup
1. Remove deprecated endpoint fields and old hook branches.
2. Remove migration logs and temporary adapters.
3. Keep only one source of truth: backend evaluator.

## Testing plan

### Evaluator unit tests
- claim granularity: `manifest` vs `canvas`
- completion flags: subject/parent complete combinations
- capacity boundaries: `maxContributors` under/equal/over
- user state: none/in-progress/in-review/completed/rejected/expired
- policy flags:
  - `preventContributionAfterRejection`
  - `preventContributionAfterSubmission`
  - `preventMultipleUserSubmissionsPerResource`
  - `preventContributionAfterManifestUnassign`
  - `allowSubmissionsWhenCanvasComplete`

### Endpoint integration tests
- both routes return valid `workflowV2` for same task graph expectations
- invalid task filtering parity between routes
- manifest complete while canvas incomplete and inverse cases
- capacity reached with/without existing contributor claim

### Frontend tests
- hooks map server decisions only
- no policy checks based on raw config/task status in the hook body
- page-level tests assert read-only/edit states from `workflowV2.decision` and `workflowV2.status`

## Acceptance criteria
1. Frontend no longer recomputes claim/submit/block policy from raw tasks/config.
2. `isManifestComplete` ambiguity is removed from decision-making paths.
3. Canvas workflow UI can render from one canonical workflow payload plus optional parent summary.
4. Route logic in `site-manifest-tasks.ts` and `site-canvas-tasks.ts` becomes data loading + evaluator call only.
5. Behavior for claim, submit, resubmit, review, and expired-claim flows remains intact.
