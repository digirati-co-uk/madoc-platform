# NLW integration verification

Validated on `feature/misc-fixes` against the local application on 2026-10-22. The current focused suites contain 130 passing tests across 14 suites (51 field/settings, 34 export, 45 workflow), run by the implementation/review agents and the integration checks described below. This records actual checks separately from the proposed acceptance tests in each ticket plan.

## Completed checks

- NS-10 and NS-30: 51 focused tests passed on Node 24, followed by a separate GPT-6.1 Sol review with no blocking findings. Targeted lint passed.
- NS-10: the authenticated Model page for project 1 saved changed instructions, then saved empty instructions and description. Reload retained the empty strings. An existing canvas contribution still displayed its original transcription. The original project configuration was restored after the check.
- NS-53 API baseline: the running task service returned distinct first/second pages with `per_page=1`, correctly applied `modified_at:desc`, and returned no rows for a completed-status filter on the two not-started manifest tasks. `modified_at` is numeric milliseconds. Missing cached metadata was observed directly.
- NS-73 initial happy path: real export task `2c5dec08-4325-4a44-808d-7854ae2b782e` completed and produced a ZIP containing the CSV for manifest 37702. Its two approved contribution rows referenced canvases 66689 and 66690 and the correct original manifest URI.
- NS-73/NS-78: independent second review found no remaining blockers; 34 tests across seven suites passed. Final scoped export lint passed.
- NS-73 mixed-event integration: synthetic export parent `f3675d0b-c50e-4d81-a1cd-7d7970d66fa1` and two manifest children were created through the real task API, with a known CSV fixture on disk. Actual terminal events `[3, -1]` completed the parent as “completed with errors”, retained the failed child at `-1`, and published the successful CSV plus `README-errors.txt`. Two concurrent repeated parent completion PATCHes left the archive SHA-256 unchanged (`9e6070500ba4f3efe8a8155217ae0f7cb9e9b1dd4ec29986510131e496bb59d7`). This verifies the real event/queue/publication path; it is distinct from the real-data happy-path export above.
- NS-78: manifest 37702/project 1 preview and browser download succeeded. Parsed download contained exactly two rows for canvases 66689/66690. Switching to the existing Manifest API option rendered its JSON preview. The fixture has only one associated project, so cross-project switching was covered by the component regression rather than a live two-project fixture.
- NS-49: final browser save showed one effective transcription field, refreshed without an error boundary, and displayed “Corrections saved”. Task status/state and complete revision metadata stayed unchanged. Cancel/discard did not persist the draft. Both the published-model endpoint and approved CSV raw-data endpoint reflected the correction. The original transcription was then restored through the correction UI and verified.
- NS-53: authenticated root overview displayed two tasks and missing cached canvas counts as em dashes. Client navigation to Done returned zero tasks, as expected. API pagination/sorting checks are recorded above.
- Final server, producer and production frontend bundles built successfully. Server and queue processes were restarted; PM2 reported all applications online.

## Findings addressed during integration

The independent export review identified the task service's all-siblings terminal-event semantics, duplicate ZIP finalization, and stale entity filters when switching projects. Browser execution also reproduced `ReferenceError: Buffer is not defined` in the shared CSV serializer. The implementation and independent second review resolved all four findings. The correction runtime check also exposed superseded blank fields and a hydrated-cache refetch failure; both received focused regressions and passed the final browser check.

## Environment and limits

The Docker app had a stale single-file mount for `config.json`. Recreating only the app container restored that mount. Its database also records a migration from a different branch whose file is absent here; the server was started with `MIGRATE=false` for this session. No migration files or database schema were changed. Future container recreation on this branch may require the same runtime override until the branch and local migration history agree.

Repository-wide TypeScript checking is blocked by dependency declaration syntax unsupported by the installed TypeScript 4.9. This is not represented as a passing type check. Targeted tests, lint, builds, and runtime checks provide the recorded validation.

Live limits: no large (>50-child) overview fixture, no live multi-project manifest fixture, and no live manifest-level/no-review correction fixture were created. These boundaries remain covered by focused logic tests and review rather than claimed end-to-end verification. Automatic search refresh and its failure/retry path passed the live check below.

## Final workflow revision checks

The first workflow review found unrelated nested-entity correction targets, missing search refresh, and inherited parent-page drilldown. The fixes restrict nested ownership, refresh existing canvas/manifest indexes, and reset child links to page one. The revised focused tests pass: 44 tests across four suites.

The final correction UI automatically indexed manifest 37702 and canvas 66690 with zero warnings/import failures. A unique corrected-text marker appeared in both Typesense documents. During restoration, a browser-only response injection simulated indexing warnings: the form correctly reported that the correction was saved but search failed, disabled further saving, and offered search-only retry. Removing the injection and retrying refreshed search and closed the form; exactly one PUT occurred throughout save and retry. The original text was restored, the marker disappeared from search, and all browser instrumentation was removed. Final server/frontend builds passed and the server was restarted.

The second workflow review approved NS-49 and found one remaining reverse-navigation page leak in NS-53. Back and row drilldown now use the same page-reset link helper. The updated overview suite passes all seven tests (45 workflow tests total across the current suites), and the third targeted review found no remaining issues. Live Back navigation from a manifest URL at page 3 returned to page 1 of the root and displayed both manifests with sorting retained. Final server/frontend builds passed after this fix.
