---
name: madoc-frontend
description: Madoc React route loading, resource context, SSR/hydration, and shared frontend integration. Applies when UI behavior depends on those mechanisms; isolated styling or copy edits can use AGENTS.md alone.
---

# Madoc Frontend

## Locate the surface

- Site: `src/frontend/site/routes.tsx`, `src/frontend/site/server.ts`
- Admin: `src/frontend/admin/routes.tsx`, `src/frontend/admin/server.tsx`
- Account: `src/frontend/account/`
- HTTP-to-SSR bridges: `src/routes/frontend/`; HTML templates: `src/site.html`, `src/admin.html`, `src/account.html`
- Shared loaders/components: `src/frontend/shared/`
- Themes: `src/frontend/themes/`, `themes/`
- I18n: `src/middleware/i18n/`, `src/utility/language-cache.ts`
- Email HTML/text pairs: `src/emails/`

## Routes and resource context

Follow the route's `createUniversalComponent` loader and server/client consumers; use the loader, link, and SSR rules in `AGENTS.md`.

- Context merges in `src/frontend/site/hooks/use-route-context.ts`. Check both URL and slot-derived values, including manifest/canvas `/model` routes.
- Under `/projects/:slug`, keep Typesense results, facet discovery, autocomplete, and result links in the same project context.
- Manifest `/model` contributions compose their preview and editor in `ViewManifestModel`; keep its `HorizontalEditorSplit` behavior aligned with the canvas contribution editor.
- Deep-merge nested site/project configuration to retain sibling options. Keep MJML and plain-text email content equivalent.

## SSR and build integration

- Follow the HTTP bridge into the matching renderer. Preserve redirects and the `body`, `head`, `htmlAttributes`, and `bodyAttributes` contract, plus `<!--ssr-head-->` and `<!--ssr-outlet-->` template markers.
- Keep `vite/styled-components.js` and CommonJS aliases aligned across frontend, dev-server, and SSR configs. The current Vite configs use `@rolldown/plugin-babel` for Babel plugins; inspect them before changing transforms.
- `rich-markdown-editor` can expose a nested CommonJS default; retain import normalization when changing its wrapper.

## Verify

Exercise affected route behavior on initial SSR load and client navigation. Shared renderer/template changes need each affected site, admin, and account surface; layout work follows the runtime smoke check in `AGENTS.md`.
