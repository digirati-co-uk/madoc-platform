## Open development

All work on Madoc happens directly on [Github](https://github.com/digirati-co-uk/madoc-platform) with [issues](https://github.com/digirati-co-uk/madoc-platform/issues) and [discussions](https://github.com/digirati-co-uk/madoc-platform/discussions) for bugs, features and requests. 

## Versioning

Madoc uses Semantic versioning, although for an application this does not mean that every internal API will remain 
unchanged. Major versions will only be used for breaking changes of the API and features, for example:
- Removal of user-features
- Removal of properties on public API endpoints
- Removal of entire API endpoints

Some changes may be perceived as breaking, but would not be a major version, examples include:
- Iterative improvements to existing workflows
- UX improvements
- Changing of Project template defaults (as these would not affect existing projects)

All versions may include new, feature-flagged changes and would be experimental to use. 

All changes will be kept in the [Change log](./CHANGELOG.md). Migration, if any, should always be automatic and
should not require input from an Administrator.

## Development
Most of the code in this repository is Typescript. Due to the size of the codebase Typescript is important to enable
safe-refactoring and code-assistance at scale. The project also uses eslint. 

### Preparing for development

Requirements:
- Node 16+
- Yarn
- Docker (+ compose)

After cloning `madoc-platform`, you will need to create a few folder with the correct permissions:
```
mkdir -m 700 var/shared-database
mkdir -m 777 var/files
```

If they already exist, you will need to ensure the permissions are set:
```
chmod 700 var/shared-database
chmod 777 var/shared-database
```

go into the `services/madoc-ts` directory and run the following commands:
```
yarn
yarn build
```

This will create the initial bundles. You should only have to do this once (for frontend development).

### Frontend development

From the root directory, simply run:
```
bin/madoc up
```
And after a short while Madoc will be available at [http://localhost:8888](http://localhost:8888)

At this point, any frontend changes should be immediately visible on the site. 

Server-side rendering will not be available and you may not see changes here. If you also want to reload changes
for SSR you can run:
```
yarn watch:vite-server
```
These changes may not be reflected immediately (~5-15 seconds). 

### Server development

From the root directory, first you need to run:
```
bin/madoc up
```

and then, from the `service/madoc-ts` folder run:
```
yarn watch:vite
```

This will watch for changes on the server and reload periodically. Madoc currently has a "zero-downtime" reload system,
but you can tail the logs of the `madoc-ts` service:
```
docker-compose logs --tail 50 -f madoc-ts
```
To see when changes are reloaded.

This is due to be improved in the future with server-side hot-reloading.


### Development cycle
