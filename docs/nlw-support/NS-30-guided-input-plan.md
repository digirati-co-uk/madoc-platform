# NS-30 — Guided input redesign

Ticket: [NS-30](https://digirati.atlassian.net/browse/NS-30).

The initial format selector provided advisory messages but did not make the expected entry clear. This plan replaces it with explicit format choices, examples and guided entry in the existing Text field. The implemented scope is recorded in [NS-30](NS-30.md), committed as `25ad5527` after three independent review rounds and 114 passing focused tests.

## Configuration and entry

Use a grouped format selector with an example in every option. Include whole numbers and decimal point/comma alternatives; day-first, month-first and year-first dates; month/year and year-only dates; 24-hour times with or without seconds; and common date-and-time combinations. A local “Try it” control demonstrates the selected format.

For fixed formats, show the remaining template inside the input as the contributor types and insert separators automatically. Keep the actual value a string. Validate calendar and clock values on completion or blur, without marking unfinished focused input red. Preserve normal selection, replacement, deletion, paste and composition behavior. Reject incompatible paste explicitly rather than silently discarding characters or changing date order.

Offer a bounded custom pattern: `#` for a digit, `@` for a letter and `*` for a letter or digit, with escaping for literal symbols. Limit pattern length and slot count. Explain that custom patterns validate shape, not calendar meaning. Invalid configuration must be checked by the actual settings save path, including autosave.

## Compatibility and boundaries

Do not rewrite stored values on load or when changing formats. Preserve leading zeros, decimal precision, incompatible saved strings and the accepted values of the original format IDs. Unknown formats fall back safely to free text. Multiline fields remain unrestricted. Existing Date fields and their historical-year behavior remain unchanged.

Preview and Try it values remain local. They must not invalidate or implicitly submit the settings form. Prevent incomplete new preview values from becoming defaults while retaining existing saved defaults.

No database migration or new storage representation is required. The separate tabular editor is outside this change. Validation tracing confirmed that there is no generic field-value validator consumed by all submission paths: this iteration provides input-level feedback, while submission and review policy remain unchanged. [Submission enforcement](NS-30-submission-validation.md) is a separate plan. Twelve-hour time and quick-switch chips are not required for this iteration.

## Delivery and verification

GPT-6.1 Sol implements the design supplied by Claude Sonnet 5.5, with an independent review afterward. Verify pure mask and calendar logic alongside real input events, caret behavior, paste, deletion and composition. Check default Text field creation, format settings save/reopen, preview isolation, custom configuration errors, multiline compatibility and stored-value preservation in the browser. Rebuild affected bundles, record limitations, and integrate ticket-first commits and changelog references after review.

The default field creation fix is committed as `d262a9c0`. Seven focused tests passed under Node 24, with the existing unrelated Dropdown theme-type diagnostic excluded narrowly. Two independent review rounds found no remaining issues after correcting stale options for in-place plugin registration. Browser verification on project 21 confirmed default Text field Save and persistence after reload; the temporary field was removed and the original date field retained.
