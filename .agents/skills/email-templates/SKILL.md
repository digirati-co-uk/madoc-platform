---
name: email-templates
description: Edit Madoc TS email templates and rendering helpers. Use when changing MJML email content or updating plain-text email generation in services/madoc-ts.
---

# Email Templates (Madoc TS)

## Overview
Describe how MJML-based email templates are defined and rendered to HTML/text.

## Key Entry Points
- Email templates: `services/madoc-ts/src/emails/*.tsx`
  - `reset-password-email.tsx`
  - `user-activation-email.tsx`

## Template Structure (Based on Source)
- Templates use `mjml-react` components to build MJML.
- Each template file exports:
  - A React component for MJML layout
  - A `create*Text` helper for plain-text fallback
  - A `create*Email` helper that renders MJML to HTML

## Quick Start Workflow
1. Update the MJML React component to change layout or content.
2. Keep the text-only template in sync for non-HTML clients.
3. Ensure all interpolated variables are present in both HTML and text versions.

## Common Tasks
- Update copy and CTA text
- Add/remove fields in email templates
- Adjust button or heading styles

## Pitfalls
- Updating MJML but forgetting to update the text template
- Introducing variables not present in all templates

## Suggested Checks
- Render MJML to HTML and verify output
- Confirm text version contains the same core content
