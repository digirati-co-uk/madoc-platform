---
name: madoc-frontend
description: Work on Madoc TS site, admin, or account React routes, loaders, shared UI, resource context, themes, internationalization, email templates, client hydration, or server-side rendering. Use for frontend and SSR changes in services/madoc-ts.
---

# Madoc Frontend

## Choose the surface

- Site routes and SSR: `src/frontend/site/routes.tsx`, `src/frontend/site/server.ts`, `src/routes/frontend/site-frontend.ts`
- Admin routes and SSR: `src/frontend/admin/routes.tsx`, `src/frontend/admin/server.tsx`, `src/routes/frontend/admin-frontend.ts`
- Account UI and SSR: `src/frontend/account/`, `src/routes/frontend/account-frontend.ts`
- Shared components, loaders, and utilities: `src/frontend/shared/`
- HTML templates: `src/site.html`, `src/admin.html`, `src/account.html`
- Themes: `src/frontend/themes/`, `themes/`
- I18n: `src/middleware/i18n/`, `src/utility/language-cache.ts`
- Email HTML/text pairs: `src/emails/`

## Route and data workflow

1. Locate the route object and its `createUniversalComponent` loader.
2. Keep `getKey` deterministic for the same params/query and trace server plus client consumers of loaded data.
3. Use `ApiClient`, `useData`, and `useStaticData`; do not add route-local `fetch` without a concrete reason.
4. Build links with `createLink` or `useRelativeLinks` so site/project context survives.
5. Verify the resource context, including slot-derived values and the manifest/canvas `/model` route.
6. Keep Typesense results, facet discovery, autocomplete, and result links in the same project context when under `/projects/:slug`.

## SSR workflow

1. Trace the HTTP bridge in `src/routes/frontend/` into the matching frontend server renderer.
2. Preserve redirect results and the `body`, `head`, `htmlAttributes`, and `bodyAttributes` contract.
3. Keep `<!--ssr-head-->` and `<!--ssr-outlet-->` aligned with the relevant HTML templates.
4. Guard browser APIs with the existing server check.

## Guardrails

- Follow the Tailwind/styled-components migration rule in `AGENTS.md`.
- Keep CommonJS compatibility aliases aligned across the frontend, dev-server, and SSR Vite configs.
- `rich-markdown-editor` may expose its React component as a nested CommonJS default; normalize the imported value before rendering it.
- Keep site and admin permissions and components on the correct surface.
- Deep-merge nested site/project configuration rather than overwriting sibling options.
- Keep MJML and plain-text email content equivalent.

## Check

Verify the affected route through SSR and client navigation. For shared SSR or template changes, check the affected site, admin, and account surfaces; for UI changes, smoke-test `https://madoc.local`.
