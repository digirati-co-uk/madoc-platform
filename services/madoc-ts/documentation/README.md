# Madoc documentation screenshots

This helper runs a plain JavaScript scenario against Madoc, prepares data through the API, opens authenticated pages in Chromium, and saves stable screenshots.

## Setup

Create a local API key owned by a global administrator. Give it the scopes required by the scenario; `site.admin`, `tasks.admin`, and `models.admin` cover the built-in setup helpers. Keep the credentials in environment variables rather than scenario files.

Put local credentials in `services/madoc-ts/.env`; the helper loads it automatically:

```dotenv
MADOC_CLIENT_ID=...
MADOC_CLIENT_SECRET=...
```

Install Chromium once:

```shell
pnpm exec playwright install chromium
```

Run the example from `services/madoc-ts`:

```shell
MADOC_CLIENT_ID=... \
MADOC_CLIENT_SECRET=... \
pnpm docs:screenshot documentation/scenarios/project-overview.mjs
```

The defaults target `https://madoc.local`, use the `default` site, and write PNGs to `documentation/screenshots`. Override them with `MADOC_BASE_URL`, `MADOC_SITE`, and `MADOC_SCREENSHOT_DIR`. Add `--headed` while developing a scenario.

Scenarios intentionally leave their setup data in Madoc so the resulting pages remain inspectable. Run them against a disposable local installation or delete that data in the scenario when cleanup matters.

## Scenarios

A scenario default-exports one async function. It receives the authenticated admin browser session, direct API access, and common setup helpers:

```js
export default async function scenario({ admin, api, createProject, createUser, importManifest, login, waitForTask }) {
  const project = await createProject({
    label: 'Newspaper transcription',
    summary: 'Transcribe the newspaper pages.',
    slug: `newspaper-${Date.now()}`,
    template: '@madoc.io/crowdsourced-transcription',
  });

  await importManifest(process.env.IIIF_MANIFEST);

  const contributor = await createUser({
    email: 'docs-contributor@example.com',
    name: 'Documentation contributor',
    siteRole: 'transcriber',
  });
  const contributorSession = await login(contributor.credentials);

  await admin.gotoAdmin(`/projects/${project.id}`);
  await admin.screenshot('admin/project');

  await contributorSession.goto(`/projects/${project.slug}`);
  await contributorSession.screenshot('contributor/project');
}
```

`admin` and role-specific sessions expose `page`, `api`, `goto`, `gotoAdmin`, `screenshot`, and `close`. Navigation and screenshots wait for Madoc's client hydration marker and then for the local Vite loading banner to disappear. Use the Playwright `page` directly for UI steps such as filling a contribution. Use `api(path, { method, body })` for scenario-specific setup that does not warrant another helper.

`createUser` is rerunnable for the same email: it updates the name and roles, resets the password through Madoc's normal reset flow, and returns fresh login credentials. `importManifest` waits for its task by default; pass `{ wait: false }` when the in-progress state is what the documentation needs.
