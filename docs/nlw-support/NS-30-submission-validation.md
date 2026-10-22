# NS-30 — Submission validation follow-up

Ticket: [NS-30](https://digirati.atlassian.net/browse/NS-30). Deferred for review; not implemented by the guided-input redesign.

Guided inputs can explain format errors without changing contribution policy. Preventing all invalid submissions is a broader change because ordinary submission, batch submission, direct editing, corrections and approval use different write paths. The existing field plugin contract has no generic value-validation hook. Native HTML validity does not gate the JavaScript submission handlers.

## Proposed scope

Create a pure validator for effective ordinary revision fields using the authoritative field configuration. Traverse nested fields and respect inactive, deleted and superseded values. Preserve the existing required-field and selector policy. Allow incomplete drafts and unchanged historical values; validate newly changed values without treating arbitrary incompatible text as proof of historical provenance.

Connect errors to `new/hooks/use-can-submit.ts`, then assert validity at `editor/stores/revisions/revisions-store.tsx::persistRevision` for submitted/accepted writes. This covers ordinary and batch callers of `useViewerSaving`; explicit `canSubmit` overrides also need checking.

Address the 100 ms debounced field-update window in `FieldInstance.tsx`, `SingleFieldInstance.tsx` and `DefaultInlineField.tsx`: saving must validate and persist the latest visible input. Make guided updates synchronous or reliably flush pending changes before writing.

Add changed-value guards to `DirectEditButton`, approved correction `applyValueCorrections`, and direct approval handlers. Keep rejection and request-changes actions available. Use baselines to preserve untouched historical values, attribution and approval status.

Server enforcement requires separate consideration. Revision create/update can validate submitted/accepted requests against stored configuration, while full-model PUT is also used for model settings. Blanket validation there would prevent unrelated settings changes when old defaults do not match a new format. Decide how value-edit intent is represented before enforcing full-model writes.

## Boundaries and acceptance

The tabular editor renders its own inputs and bypasses ordinary TextField settings. Either extend its mask/error UI before introducing a shared blocking gate, or explicitly scope enforcement to supported ordinary fields. Do not strand grid users with errors they cannot understand or correct.

Test nested and conditional fields, batch submission, immediate typing followed by Save, draft persistence, direct review edits, approved corrections and direct approval. Verify invalid new values are rejected on every in-scope write path, while incomplete drafts, untouched historical values, settings changes and existing selector rules continue working. Define whether server enforcement is required; client-only checks must not be described as universal data integrity.
