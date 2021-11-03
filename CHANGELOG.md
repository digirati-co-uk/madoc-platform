# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/digirati-co-uk/madoc-platform/compare/v2.0.0...main)

- [Internal] Added new "api.crowdsourcing" namespace to consolidate crowdsourcing APIs together. 

### Fixed

- Fixed bug with resolving image services on content resources without heights/widths (via [@atlas-viewer/iiif-image-api](https://github.com/atlas-viewer/iiif-image-api/commit/4fd3266426d2608bc6a7e307e92687c197bd6e8d)) 
- Fixed bug where "No document exists" would appear multiple times in the sidebar
- Fixed bug where logged-out user would make requests to personal notes (with a 401)
- Fixed missing annotations on model page
- Fixed message "Maximum number of contributors reached" for logged-out user
- Fixed bug where short submissions would appear collapsed in sidebar
- Fixed re-fetching on window focus
- Fixed bug where draft annotations could be seen

## [2.0.0](https://github.com/digirati-co-uk/madoc-platform/releases/tag/v2.0.0) - 2021-XX-XX
First stable release of Madoc 2.0
Check out the [documentation](https://docs.madoc.io)

For [Madoc v1.x](https://github.com/digirati-co-uk/madoc-platform/tree/v1.x) you can see the [changelog](https://github.com/digirati-co-uk/madoc-platform/blob/master/CHANGELOG.md)
