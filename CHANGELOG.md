# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/digirati-co-uk/madoc-platform/compare/v1.0.1...master)
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
    - Capture models can now be translated inside of Omeka and will correctly be served depending on your locale
- Added files and database volumes to default docker-compose
- Added new docker compose specifically for running on CI
- Added new `ci-start` and `ci-stop` commands to madoc cli
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

### Fixes
- [UPSTREAM](https://github.com/digirati-co-uk/madoc-omeka-s/commit/b50bdb40fd586f32ae2466862dbe596cb6aeb1f2) Added send mail to base container
- Fixed default mailer configuration, so you can send emails without configuration SMTP
- Fixed bug where flagging may cause an error for some users (permissions)
- Fixed icon spacing on page actions on canvas page
- Fixed bug in container with latest annotated images media - would before throw error
- Fixed bug in container with top contributors media - would also throw error 
- Fixed capture model translations in annotation studio module
- Fixed bug where a mis-configured Elucidate may break some pages on the site
- Fixed issue where multiple HTML page blocks on the same page would not save
- Fixed bug where you could sync without Transfiex enabled

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
