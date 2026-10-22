# NLW support work

Bounded changes are integrated on `feature/misc-fixes`; larger lifecycle and aggregation work remains planned below. Ticket-specific files record current-code evidence, implementation scope, deferred requirements, and verification. No database migrations or major lifecycle changes are in scope.

## Work allocation

| Tickets | Workstream | Approach |
| --- | --- | --- |
| [NS-10](https://digirati.atlassian.net/browse/NS-10), [NS-30](https://digirati.atlassian.net/browse/NS-30) | Transcription settings and capture fields | Reuse configuration and field extension mechanisms; preserve stored contributions and existing date values. |
| [NS-33](https://digirati.atlassian.net/browse/NS-33), [NS-49](https://digirati.atlassian.net/browse/NS-49), [NS-79](https://digirati.atlassian.net/browse/NS-79) | Contribution deletion and correction | Establish what already works, then separate safe existing-flow fixes from changes to attribution, publication, or review state. |
| [NS-53](https://digirati.atlassian.net/browse/NS-53) | Admin crowdsourcing overview | Assess available task data and pagination before designing the overview; avoid per-row request fan-out. |
| [NS-73](https://digirati.atlassian.net/browse/NS-73), [NS-78](https://digirati.atlassian.net/browse/NS-78) | Manifest exports | Add a manifest CSV option through existing export machinery where feasible; assess cross-project manifest exports separately. |

## Integration checks

GPT-6.1 Sol handles implementation and independent code review. Claude Sonnet 5.5 provides focused design guidance where a meaningful UI decision is needed. Integration includes focused regression tests, affected build bundles, PM2 restarts, and authenticated checks on `https://madoc.local`.

Implementation commits use ticket-first summaries. Changelog entries link the relevant ticket and implementation commit. The pre-existing change to `services/madoc-ts/translations/en/madoc.json` is excluded from this work.

## Delivered scope and deferred plans

| Ticket | Scope on this branch | Further work |
| --- | --- | --- |
| [NS-10](NS-10.md) | Editable transcription instructions and description through existing project configuration. | Historic review metadata remains unchanged. |
| [NS-30](NS-30.md) | Numeric, time and date-time hints for text fields; existing date-only field retained. | Tabular format changes and mandatory validation remain outside scope. |
| [NS-33](NS-33.md) | Current deletion behavior assessed and staged plan written. | Individual deletion, reopening and shared-review cleanup need lifecycle decisions and broader verification. |
| [NS-49](NS-49.md) | Bounded corrections of existing approved values/box regions; approval and attribution preserved. | Deletion, tabular/custom renderers, schema editing and server concurrency protection remain deferred. |
| [NS-53](NS-53.md) | Paginated task overview with status filters, sorting and cached canvas counts. | Latest contributor, annotation totals and true latest-contribution dates need a batched data contract. |
| [NS-73](NS-73.md) | Contributions CSV per manifest, with partial ZIP completion and idempotent archive publication. | Failed resources require a fresh export; publication and notification are not transactional. |
| [NS-78](NS-78.md) | Manifest admin CSV preview/download for one selected project. | Multi-project/bulk downloads and additional format variants remain planned. |
| [NS-79](NS-79.md) | Full resource-model correction page assessed and staged plan written. | Separate editor and persistence design required. |

[Integration verification](verification.md) records tests, reviews, live checks and known environment limits. Ticket plans distinguish implementation from later acceptance checks; they do not imply that the entire Jira ticket is closed.
