# Custom capture model editor hooks (canvas-first)

This guide documents two new hooks for building custom capture model editors without replacing the existing Madoc save/claim workflow.

## Why these hooks

The existing capture model flow is powerful but difficult to use from custom UIs. These hooks provide a thin API layer over current internals:

- `useCaptureModelEditorApi` gives a spreadsheet-friendly read/update API for capture model fields.
- `useCaptureModelContributionLifecycle` gives an orchestration API for prepare/load/revision/save/submit/next-image state.

Both hooks are canvas-focused in v1 and intentionally keep backend/save semantics unchanged.

## Hook locations

- `useCaptureModelEditorApi`:
  `/services/madoc-ts/src/frontend/shared/capture-models/new/hooks/use-capture-model-editor-api.ts`
- `useCaptureModelContributionLifecycle`:
  `/services/madoc-ts/src/frontend/site/hooks/use-capture-model-contribution-lifecycle.ts`

## Architecture overview

These hooks sit on top of existing systems:

- Revision state and mutation: `Revisions` store.
- Revision persistence: `useViewerSaving`.
- Claim/task update path: `useCanvasUserTasks().updateClaim` using `createResourceClaim`.
- Canvas preparation/claim bootstrap: `usePreparedCanvasModel` and `prepareResourceClaim`.
- Next canvas data: `useManifestStructure` + `useRelativeLinks`.

No backend routes were added and no current submit button components were changed.

## Prerequisites

Your custom editor must run inside existing capture model providers, especially `RevisionProviderWithFeatures`.

Typical placement:

1. A page or feature already loading capture model data.
2. Wrapped in `RevisionProviderWithFeatures`.
3. Your custom component calls these hooks inside that provider.

If a revision provider is not present, revision-driven APIs will not work.

## Quick start (spreadsheet + lifecycle)

```tsx
import React from 'react';
import { HrefLink } from '../../frontend/shared/utility/href-link';
import { useCaptureModelEditorApi } from '../../frontend/shared/capture-models/new/hooks/use-capture-model-editor-api';
import { useCaptureModelContributionLifecycle } from '../../frontend/site/hooks/use-capture-model-contribution-lifecycle';

export const SpreadsheetEditor: React.FC = () => {
  const lifecycle = useCaptureModelContributionLifecycle();
  const table = useCaptureModelEditorApi({ tableProperty: 'rows' });

  if (lifecycle.phase === 'loading' || lifecycle.phase === 'preparing') {
    return <div>Loading model...</div>;
  }

  if (lifecycle.phase === 'blocked' || lifecycle.phase === 'error') {
    return (
      <div>
        <p>Contribution unavailable.</p>
        {lifecycle.lastError ? <pre>{lifecycle.lastError.message}</pre> : null}
      </div>
    );
  }

  if (table.status !== 'ready') {
    return <div>Table is not available: {table.errors.join('; ')}</div>;
  }

  return (
    <div>
      <button onClick={() => table.addRow()}>Add row</button>

      <table>
        <thead>
          <tr>
            {table.columns.map(column => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map(row => (
            <tr key={row.entityId}>
              {table.columns.map(column => {
                const cell = row.getCell(column.key);
                return (
                  <td key={column.key}>
                    <input
                      value={String(cell?.value ?? '')}
                      onChange={event => row.setCell(column.key, event.target.value)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={() => lifecycle.saveForLater()}>Save for later</button>
      <button onClick={() => lifecycle.submit()}>Submit</button>

      {lifecycle.nextCanvas.hasNext && lifecycle.nextCanvas.next ? (
        <HrefLink href={lifecycle.nextCanvas.next.href}>Next image</HrefLink>
      ) : null}
    </div>
  );
};
```

## Full contribution flow (start to finish)

This section maps to real user flow, from empty canvas to submitted contribution and next-image data.

1. Open canvas with no capture model yet

- `useCaptureModelContributionLifecycle().phase` will be `loading` or `preparing`.
- Existing prepare/claim process runs through current hooks.

2. Prepare and load complete

- Lifecycle transitions to `ready`.
- `hasCaptureModel` becomes `true` once the capture model is loaded.

3. Revision selection/creation

- Hook auto-attempts deterministic revision creation/selection.
- If deterministic selection is not possible, `needsRevisionSelection` is `true`.

4. Render table editor

- Call `useCaptureModelEditorApi({ tableProperty: 'yourEntityListProperty' })`.
- `status` must be `ready`.

5. Edit cell values

- Use `setCell` or `row.setCell` to update local revision state.
- These updates are local; no network save occurs yet.

6. Handle non-table top-level fields

- Use `topLevelFields` for properties such as notes/comments.
- These can be rendered in separate components outside the table.

7. Save for later

- Call `saveDraft()` or `saveForLater()`.
- This persists revision status `draft` and runs claim update via existing workflow.

8. Return later and continue

- Existing revision logic restores draft behavior.
- Continue edits with table APIs.

9. Submit

- Call `submit()`.
- This persists revision status `submitted` and updates claim as submitted.

10. Next image data

- Read `nextCanvas` for data-only navigation information.
- Includes `hasNext`, `currentIndex`, `total`, and `next` with `{ id, label, thumbnail, href }`.

## `useCaptureModelEditorApi` reference

### Input

- `tableProperty: string` (required)
- Must be a top-level property containing an entity list.

### Output

- `status`: `'ready' | 'missing-revision' | 'invalid-table-property'`
- `revisionId?: string`
- `columns: TableColumn[]`
- `rows: TableRowRef[]`
- `rowCount: number`
- `addRow()`
- `removeRow(rowIndex)`
- `getCell(rowIndex, columnKey)`
- `setCell(rowIndex, columnKey, value)`
- `topLevelFields: Record<string, TopLevelFieldRef[]>`
- `errors: string[]`

### Notes

- Columns are derived from row field properties (union fallback across rows).
- Only local revision state is mutated.
- Row/column operations use existing revision store actions.

## `useCaptureModelContributionLifecycle` reference

### Output

- `phase`:
  - `loading`, `preparing`, `ready`, `saving-draft`, `submitting`, `submitted`, `blocked`, `error`
- Core booleans:
  - `hasCaptureModel`, `hasExpired`, `canContribute`, `canUserSubmit`, `preventFurtherSubmission`, `markedAsUnusable`
- Revision:
  - `needsRevisionSelection`, `revisionId`
- Next image data:
  - `nextCanvas`
- Actions:
  - `refresh()`, `prepare()`, `ensureRevision()`, `saveDraft()`, `saveForLater()`, `submit()`
- Errors:
  - `lastError?: Error`

### Save behavior

- Explicit save model only (no default autosave network writes).
- `saveDraft` writes revision as `draft`.
- `submit` writes revision as `submitted`.

## Error and blocked-state handling

Recommended UI handling:

- `loading` / `preparing`: show skeleton/progress UI.
- `ready`: enable table editing + save/submit.
- `saving-draft` / `submitting`: disable interactive buttons.
- `submitted`: show completion state and next-image action from `nextCanvas`.
- `blocked`: disable write actions and show reason/context.
- `error`: show `lastError?.message` and provide retry (`refresh`, `prepare`, or action retry).

## Migration from ad-hoc `Revisions` usage

Before:

- Components manually called `Revisions` actions and duplicated save/claim/prepare logic.

After:

1. Keep existing providers (`RevisionProviderWithFeatures`) unchanged.
2. Replace ad-hoc table mutations with `useCaptureModelEditorApi`.
3. Replace local lifecycle orchestration with `useCaptureModelContributionLifecycle`.
4. Keep existing backend/save flow untouched.

This migration keeps behavior compatible while reducing custom editor complexity.
