mts := services/madoc-ts

mts-dependencies:
	cd $(mts) && yarn install

mts-watch-site:
	cd $(mts) && yarn build:frontend --watch

mts-watch:
	cd $(mts) && yarn tsc -p . --watch

watch: mts-dependencies
	@NODE_ENV=development $(MAKE) -j3 mts-watch-site mts-watch
