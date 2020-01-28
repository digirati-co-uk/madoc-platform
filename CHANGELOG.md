# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/digirati-co-uk/madoc-platform/compare/v1.2.5...master)

### Added
- Sorting room service under `/sorting-room` for splitting large manifests into smaller manifests
- Gateway for composing multiple services under the main Madoc host
- Manifests with `otherContent` will now have that field imported into Omeka as a manageable resource
- Manifests with OtherContent will now have that field imported into Omeka as a manageable resource
- Added "edit in sorting room" button to Manifests in Admin
- Added "GenericService" to media items that can be attached to IIIF items
- Added missing routes for OAuth login flow
- Pre-flight request handling for `OPTIONS` requests
- Added Presley API implementation for CRUD operations on IIIF resources
- Added "display_errors" PHP configuration when `APP_ENV` is set to dev.

### Fixed

- Cross-origin errors while loading manifests in the Universal Viewer
- Support for making requests to Omeka using valid Bearer token from OAuth flow in Public User module.
- Fixed bug in is registration permitted for non-public sites

## [1.2.5](https://github.com/digirati-co-uk/madoc-platform/compare/v1.2.4...v1.2.5)

### Fixed
- Hotfix for broken transcriber role

## [1.2.5](https://github.com/digirati-co-uk/madoc-platform/compare/v1.2.4...v1.2.5)

### Fixed
- Hotfix for broken transcriber role

## [1.2.4](https://github.com/digirati-co-uk/madoc-platform/compare/v1.2.4...master)

### Fixed
- Bug where all but the `default` site were able to be translated correctly.

## [1.2.3](https://github.com/digirati-co-uk/madoc-platform/compare/v1.2.2...v1.2.3) - 2019-12-06

### Fixed
- Changed the options presented for registering users when creating a site. Will not only allow `transcriber` role to be an option. This is the only user with locked down permissions.
- Fixed the google map API configuration in the backend - will now use the configured key and load in the google maps api with that key
- Fixed the progress dots shown when transcribing an image. Will show in progress, not started and completed on the canvas page and add css classes to them.

## [1.2.2](https://github.com/digirati-co-uk/madoc-platform/compare/v1.2.1...v1.2.2) - 2019-10-21

### Fixed
- Fixes an issue in the MadocSearch module that allowed any user with a role to access all administrative functionality.

## [1.2.1](https://github.com/digirati-co-uk/madoc-platform/compare/v1.2.0...v1.2.1) - 2019-10-16

### Added
- Added root redirect for languages

### Fixed
- Fixed Public User configuration for sites (not long exists)
- Removing carousel image count - inaccurate due to performance
- Removing list image count - inaccurate due to performance

## [1.2.0](https://github.com/digirati-co-uk/madoc-platform/compare/v1.1.3...v1.2.0) - 2019-09-13

### Added
- Added configuration option to the site settings for official locales to be shown in a language switcher
- Added language switcher to the i18n module, available to be pulled into a theme
- Added configurable Annotation Studio version allowing new versions to be selected and used without a deployment.
- Added new hidden UI for administrating canvases which lets you re-ingest a thumbnail if it had previously failed.
- Local tool (for now) to build pre-release docker tags, without creating a latest tag to be manually pushed to Dockerhub.
- Added new CLI tool for getting all of the Madoc templates that can be added into a theme.
- Added basic public user profiles
- Added option to show email on public user profiles (logged in only)
- Added option for semi-public profiles, requiring authentication
- Added new `HTTP_PROXY` environment variable support for setting HTTP proxy for requesting IIIF resources
- Added new `HTTP_PROXY_PORT`, `HTTP_PROXY_USER` and `HTTP_PROXY_PASS` environment variables to easily configure an HTTP proxy.
- Added `OMEKA__INTERNAL_URL` environment variable for internal network requests
- Added `OMEKA__ANNOTATION_INDEXER` environment variable for annotation indexer service
- Added `OMEKA__SEARCH_ELASTICSEARCH` environment variable for elasticsearch service
- Added `OMEKA__ANNOTATION_ES_INDEX` environment variables for annotation indexer service
- Added `OMEKA__SEARCH_INDEXER` environment variable for search indexer
- Added elasticsearch to base docker compose
- Added [Jane Founda](https://github.com/digirati-co-uk/jane-founda) IIIF Search service
- Added [Madoc Indexer](https://github.com/digirati-co-uk/madoc_draft_indexer) service
- Added constraints to thumbnail size with customisable import options (1000px max)
- Added final case for partOf that matches original id
- Added extra check for manifest when only canvas is provided
- Added simple statistics module, talking to Elasticsearch
- Added option for static thumbnail URL
- Added logging of duplicate Omeka IDs when requesting manifests
- Added expensive option for resolving Omeka ID from IIIF resource ID
- Added warning for admin users when they are on a duplicated manifest page
- Added manifest statistics subscriber to track statistics
- Added new Search Omeka module to index created annotations in Elasticsearch
- Added annotation statistics age block, powered by Elasticsearch
- Added redirect for single collection sites when viewing entire collection

### Fixes
- Fixed bug where canvas ID list may be only a single element
- Fixed inaccurate "total images" count on manifest snippet block
- Fixed inaccurate "total images" count on manifest list by hiding it
- Fixed inaccurate "total images" count on collections by hiding it
- Fixed transcriber role issue
- Fixed "Got a packet bigger than 'max_allowed_packet' bytes" when adding very large IIIF manifests.
- Fixed import canvas reference when importing a manifest with previously imported canvases.
- Fixed IIIF requesting resources not using the HTTP client configuration from Omeka
- Fixed stale docker images on CI
- Fixed default locale on Annotation Studio (en)
- Fixed missing styles for in-progress crowd-sourcing pages
- Fixed error during import of images with thumbnails (thumbnail image service)
- Fixed error when duplicate canvases where imported into single manifest
- Moved media helpers to shared modules
- Fixed unhandled exception in top contributor page block
- Fixed bug with checking if canvas inside of manifest
- Fixes contrast issue when marking page as complete (Fixes #111)
- Fixed mark page as incomplete behaviour
- Fixed user statistics on profile page
- Fixed missing translations in Admin site

## [1.1.3](https://github.com/digirati-co-uk/madoc-platform/compare/v1.1.2...v1.1.3) - 2019-06-03

### Fixes
- Remove translation of dropdown (uiInputOptions) in capture model

## [1.1.2](https://github.com/digirati-co-uk/madoc-platform/compare/v1.1.1...v1.1.2) - 2019-03-27

### Fixes
- Removes on-disk file cache for unused modules

## [1.1.1](https://github.com/digirati-co-uk/madoc-platform/compare/v1.1.0...v1.1.1) - 2019-03-27

### Fixes
- Fixes 500 error on homepage when no blocks exist for page.

## [1.1.0](https://github.com/digirati-co-uk/madoc-platform/compare/v1.0.1...v1.1.0) - 2019-03-27
The internationalisation release.

### Added
- Added authentication check in Elucidate proxy to stop logged out users being able to create, update or delete annotations.
- Added IIIF Storage configuration
    - Collections per page (collection list)
    - Collection manifests per page (collection page)
    - Manifests per page (manifest list)
    - Canvases per page (manifest page)
- Added internationalisation module (not installed by default)
    - Multi-lingual sites configurable per page
    - Translated resources in Omeka will show on sites in correct locale
    - Transifex integration, with syncing
    - Imported IIIF resources will import multi-lingual fields into Omeka
    - Configurable language switcher page block
- Added various features to make our modules more translatable
    - Added locale fields to page blocks / media that contain free-text
    - Added attribution to list of IIIF fields imported into Omekas CMS - with importing of different locals
    - IIIF JSON-LD in Omeka will show all available languages in the JSON
    - Replaced build-in omeka HTML media and page block with additional locale setting 
    - Capture models can now be translated inside of Omeka and will correctly be served depending on your locale (#72)
- Added files and database volumes to default docker-compose
- Added new docker compose specifically for running on CI
- Added new `ci-start` and `ci-stop` commands to madoc cli
- Added carousel variation to site navigation, configurable in the site settings
- Added "all collections" link to the site navigation
- Added new `generate-translations` command to madoc cli for creating template files
- Added various translation calls to template files
- Added `TranslatableRenderer` for page blocks, allowing them to advertise localised fields
- Added translation of page blocks and media items
- Added alt text to default main logo in default theme
- Added new translation management per site (see docs for details)
    - See Omeka and Madoc translations
    - Generate and download `template.pot` files for navigation and page blocks
    - See missing translated strings quickly for a particular language
- Added translation of navigation
- Added core Madoc translations for Madoc modules 
- Added logging when sending emails using the flagging feature to aid debugging and setting up SMTP

### Fixes
- [UPSTREAM](https://github.com/digirati-co-uk/madoc-omeka-s/commit/b50bdb40fd586f32ae2466862dbe596cb6aeb1f2) Added send mail to base container
- Fixed default mailer configuration, so you can send emails without configuration SMTP
- Fixed bug where flagging may cause an error for some users (permissions)
- Fixed icon spacing on page actions on canvas page
- Fixed bug in container with latest annotated images media - would before throw error
- Fixed bug in container with top contributors media - would also throw error
- Fixed height of annotation studio and other smaller styling issues
- Fixed bug in container with top contributors media - would also throw error 
- Fixed capture model translations in annotation studio module
- Fixed bug where a mis-configured Elucidate may break some pages on the site
- Fixed issue where multiple HTML page blocks on the same page would not save
- Fixed bug where you could sync without Transfiex enabled
- Fixed bug where locale was not being passed to annotation studio (#74)

## [1.0.1](https://github.com/digirati-co-uk/madoc-platform/compare/v1.0.0...v1.0.1)  - 2019-03-27

### Added
- Added configuration for showing both logo and title on site (theme settings)

### Fixes
- Fixed bug where collection was not able to be set in CrowdSourcingBanner media item
- Fixed small CSS fixes when adding both an image logo and sub-text

### Changes
- Update [Annotation Studio](https://annotation-studio.digirati.com) to v1.0.0-rc.26

## [1.0.0](https://github.com/digirati-co-uk/madoc-platform/releases/tag/v1.0.0) - 2019-03-27
First stable release of Madoc Platform!
Check out the [documentation](https://madoc.netlify.com) to see it's features.
