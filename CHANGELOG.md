# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/digirati-co-uk/madoc-platform/compare/v1.0.1...HEAD)
The internationalisation release.

### Added
- Added new module (not installed by default) for internationalisation
- Added authentication check in Elucidate proxy to stop logged out users being able to create, update or delete annotations.
- New IIIF Storage configuration
    - Collections per page (collection list)
    - Collection manifests per page (collection page)
    - Manifests per page (manifest list)
    - Canvases per page (manifest page)
- Added new internationalisation module
    - Multi-lingual sites configurable per page
    - Translated resources in Omeka will show on sites in correct locale
    - Transifex integration, with syncing
    - Imported IIIF resources will import multi-lingual fields into Omeka
    - Configurable language switcher page block

### Fixes
- [UPSTREAM](https://github.com/digirati-co-uk/madoc-omeka-s/commit/b50bdb40fd586f32ae2466862dbe596cb6aeb1f2) Added send mail to base container
- Fixed default mailer configuration, so you can send emails without configuration SMTP
- Fixed bug where flagging may cause an error for some users (permissions)
- Fixed icon spacing on page actions on canvas page

### Added
- Added files and database volumes to default docker-compose
- Added new docker compose specifically for running on CI
- Added new `ci-start` and `ci-stop` commands to madoc cli

## [1.0.1](https://github.com/digirati-co-uk/madoc-platform/compare/v1.0.0...v1.0.1)  - 2019-03-27

### Added
- Exposed configuration for showing both logo and title on site (theme settings)

### Fixes
- Fixed bug where collection was not able to be set in CrowdSourcingBanner media item
- Fixed small CSS fixes when adding both an image logo and sub-text

### Changes
- Update [Annotation Studio](https://annotation-studio.digirati.com) to v1.0.0-rc.26

## [1.0.0](https://github.com/digirati-co-uk/madoc-platform/releases/tag/v1.0.0) - 2019-03-27
First stable release of Madoc Platform!
Check out the [documentation](https://madoc.netlify.com) to see it's features.
