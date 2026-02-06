---
name: capture-models-enrichment
description: Work on Madoc TS capture model server flows and enrichment integrations. Use when updating capture model definitions, extending capture model extension wiring, or debugging enrichment data flow in services/madoc-ts.
---

# Capture Models & Enrichment (Madoc TS)

## Goal
Explain how capture models are defined, served, and enriched so agents can safely add or debug capture model flows.

## Scope
- Capture model server behavior and endpoints
- Capture model extension registration and lifecycle
- Enrichment pipeline integration points related to capture models

## Non-scope
- General routing conventions outside capture models
- Frontend UI for capture model editing
- Unrelated extension types

## Key Entry Points
- `services/madoc-ts/src/capture-model-server/`
- `services/madoc-ts/src/extensions/capture-models/`
- `services/madoc-ts/src/extensions/`

## Quick Start Workflow
1. Inspect `services/madoc-ts/src/capture-model-server/` to understand the server and request flow.
2. Review `services/madoc-ts/src/extensions/capture-models/` for extension registration and handlers.
3. Trace data flow into enrichment logic by following capture model hooks in the extension layer.

## Common Tasks
- Add a new capture model type or capability
- Update capture model enrichment behavior
- Debug model serialization or validation

## Pitfalls
- Capture model schema drift between server and extensions
- Missing registration of a new model in the extension registry
- Enrichment steps that assume incomplete data

## Useful Local Searches
- `rg -n "capture model|capture-model" services/madoc-ts/src`
- `rg -n "enrichment" services/madoc-ts/src/capture-model-server services/madoc-ts/src/extensions/capture-models`

## Suggested Checks
- Capture model fetch request (smoke)
- Enrichment flow for a representative model
