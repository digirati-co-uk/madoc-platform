# Combined Madoc proof of concept

The new files leave `docker-compose.yml` and `./var/shared-database` unchanged. The normal combined setup reuses the **same** PostgreSQL bind mount and per-service roles as the existing local setup. The standalone setup has its **own named PostgreSQL volume** and cannot see the local database.

## Images

The four Node services share the root `pnpm-workspace.yaml` and `pnpm-lock.yaml`. Run `pnpm install` from the repository root with Node 24 and pnpm 11; the combined image uses the same frozen lockfile. The legacy tasks and storage processes still use Node 16 at runtime until their bundles and native dependencies are upgraded.

`Dockerfile` builds Madoc, the imported tasks and storage APIs, and the existing config service into one image. PM2 runs all Node processes plus Redis and nginx. Madoc now handles Okra's four OCR conversion formats in TypeScript at `/api/madoc/ocr/convert/:format`; old hOCR/ALTO URLs return a method-preserving 308. The other two old Okra formats also redirect. Legacy search and crowdsourcing URLs redirect to the migrated Madoc endpoints. They are compatibility redirects, so client code should use the new paths.

`Dockerfile.dev` layers live source, build watchers, Vite, and local TLS on that image. `Dockerfile.standalone` adds PostgreSQL 16 and Typesense 0.25.2 to the same container. PostgreSQL 16 is used only in the isolated standalone setup; the normal combined setup keeps the existing PostgreSQL 12 data directory and image. Redis AOF is persisted in both setups.

## Commands

Build the base image once before either variant:

```sh
docker build -f Dockerfile -t madoc-combined:local .
```

Run against the **existing local data** using the separate Compose file:

```sh
docker compose -f docker-compose.combined.yml up -d --no-build
```

For local hot refresh, after building the base image:

```sh
docker compose -f docker-compose.combined.yml -f docker-compose.combined.dev.yml up -d --build
```

Open `https://madoc.local` to test the dev setup. The dev overlay serves HTTPS on port 443 using the existing `var/certs/local-cert.pem` and `local-key.pem`; `madoc.local` must resolve to `127.0.0.1` (already set in this workspace's `/etc/hosts`).

For a wholly separate database and search index:

```sh
docker compose -f docker-compose.standalone.yml up -d --build
```

The standalone image build also requires `madoc-combined:local` first. The two Compose variants share the default Compose project name, so run **one variant at a time**. Do not use `down -v`: that removes named volumes. The existing `./var/shared-database` bind mount is never a target of a build or cleanup command here.

For a harmless syntax check before starting containers:

```sh
docker compose -f docker-compose.combined.yml config --quiet
docker compose -f docker-compose.combined.yml -f docker-compose.combined.dev.yml config --quiet
docker compose -f docker-compose.standalone.yml config --quiet
```

## Compatibility and limits

The imported `tasks-api` source is from `4c0b888462591b3868c5972393534d143cbb008b`; `storage-api` is from `32a9771c4bdefe37b72c835ce3807af74dc8cd04`. The OCR conversion logic was ported from Okra `8da2b323e6e360cff621a9bd9a44cdc8f8d605eb`. Keep these revisions recorded when updating the imported code.

The PoC assumes model and search data migration has finished, as requested. The existing model fallback code in Madoc still references the old API on some read errors; that fallback needs retirement before calling the legacy service fully removed in production. Redirects also need contract checks for external API clients, especially write methods. The normal combined setup disables tasks/config schema migrations because the local data is assumed migrated, while keeping every existing PostgreSQL user/schema. Standalone enables those migrations for its fresh database; Madoc's own production migration runner remains active.

The image keeps a Node 16 executable for the old tasks/storage bundles and their native `sharp` dependency. This is a compatibility bridge, not the final desired runtime. The dev setup watches Madoc, tasks, storage, and config source and runs Vite in the same container. Rebuild the image after dependency, Dockerfile, or gateway config changes.
