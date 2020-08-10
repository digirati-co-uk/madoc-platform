mts := services/madoc-ts

mts-dependencies:
	cd $(mts) && yarn install

mts-watch-admin:
	cd $(mts) && yarn build:admin --watch

mts-watch-site:
	cd $(mts) && yarn build:site --watch

mts-watch:
	cd $(mts) && yarn tsc -p . --watch

watch: mts-dependencies
	@NODE_ENV=development $(MAKE) -j3 mts-watch-admin mts-watch-site mts-watch
