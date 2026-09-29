mts-dependencies:
	pnpm install --frozen-lockfile

mts-watch-site:
	pnpm --filter madoc-ts build:frontend --watch

mts-watch:
	pnpm --filter madoc-ts exec tsc -p . --watch

watch: mts-dependencies
	@NODE_ENV=development $(MAKE) -j3 mts-watch-site mts-watch
