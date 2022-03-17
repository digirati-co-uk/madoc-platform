# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/digirati-co-uk/madoc-platform/compare/v2.0.3...main)

### Fixed
- Fixed OCR page linking from menu
- Fixed missing OCR listed
- Styling of "Suggest edit" to be clearer
- Styling of "Breadcrumbs" and labelling
- Fixed default selected field "type" - it is now "text-field" making models quicker to create
- Fixed issue where you could not de-select an entity selector
- Fixed auto-selecting the "define" region when using editing an existing region

### Added
- Added refresh on 500 error page (usually appears during deployment)
- Added new "OCR Correction" project template
- Added basic theme support for plugins
- Added bulk import of manifests
- Support for advanced `labelledBy` in capture models
  - Allow replacements like `{fieldA} - {fieldB}`
  - Allow for empty value `{fieldA/No value provided}`
  - Allow for complex empty value `{firstName} - {lastName} {@empty/untitled person}`
- Ability to reorder fields in the structure editor
- Added project option for disabling "save for later"
- Added "Selector is required" to capture model editor
- Added required selector styling using disabled field sets.
- Added "canSubmit" which will disable the Submit button if required selectors are not complete
- Added new "international-field" type to capture models
- Added new "Disable preview popup" project configuration option
- Added support for choosing "Model root" in capture model editor
- Added "tiny" variation of image wrapper [dev]
- Added preview for entity lists using selector if it's available
- Added "confirm" to deselect or confirm the current selector

### Changed
- The link in the top bar now always links to the site (previously the admin for admins).
- Changed size of the footer, minimised size
- Changed position of menu items in Admin to be more logical
- Split Add and Import collection pages, reflected in navigation
- Swapped manifests / collections order in admin
- Moved `<DocumentPreview />` from capture models to this repo
- Moved `@capture-models/*` packages into this repo (See [#529](https://github.com/digirati-co-uk/madoc-platform/pull/529))
- Changed back to choices styling

### Removed
- Removed auto-save by default, causing errors and no immediate feedback to the user

## [2.0.3](https://github.com/digirati-co-uk/madoc-platform/releases/tag/v2.0.3) - 2022-02-17

### Added
- Added notifications number to "annotations" panel to show how many are available
- Added notifications number to "documents" panel to show how many are available
- Added notifications number to "transcription" panel to show when one is available
- Added email server status to system status page
- Added configuration option to allow new users to be contributors
- Added alpha page block for canvas panel
- Added removal of Manifest JSON saved to disk after import (no longer used)
- Added "source manifest" to admin
- Added the ability to specify a reason for rejecting a contribution

### Fixed
- Fixed inconsistencies in translations
- Fixed bug sending email after registering (case-sensitivity)
- Fixed setting roles when registering with invitation
- Fixed embedded hOCR without `"format": "text/vnd.hocr+html"`
- Fixed height of viewer on smaller displays
- Fixed scrolling to top on manifest pages
- Fixed scrolling to top on canvas pages
- Fixed not found error when logged in and resetting password

## [2.0.2](https://github.com/digirati-co-uk/madoc-platform/releases/tag/v2.0.2) - 2022-01-20

### Fixed
- Fixed logging in with lower-case email address
- Fixed updating user in admin with upper-case email
- Changed memory restart level to 300MB per instance
- Fixed large collection imports not collapsing elements
- Fixed bug where task would show as complete before completing
- Fixed bug where multiple search indexing or OCR tasks would be triggered
- Fixed retry of tasks when added to queue
- Fixed bug with 404 status not being handled correctly
- Fixed bug with `null` metadata values breaking admin
- Prevent error when deleting collection (task related)
- Fixed bug with invalid i18n configuration
- Fixed bug with missing sites when reducing statistics

## [2.0.1](https://github.com/digirati-co-uk/madoc-platform/releases/tag/v2.0.1) - 2021-11-19

### Added

- Added support for capture model "structure" in project templates
- Missing translations for capture models
- Added support for new capture model editor in review screen
- Added ability for Admins to "reset" capture models and remove contributions
- New configuration option for session refresh window (default 24 hours)
- Updated [react-beautiful-dnd](https://github.com/atlassian/react-beautiful-dnd/releases/tag/v13.1.0) with React 17 support
- Updated [react-accessible-dropdown-menu-hook](https://github.com/sparksuite/react-accessible-dropdown-menu-hook/releases)
- Updated [styled-components](https://github.com/styled-components/styled-components/blob/main/CHANGELOG.md#v530---2021-05-04)
- Updated [React + React DOM](https://github.com/facebook/react/blob/main/CHANGELOG.md#1700-october-20-2020) to v17
- Added new experimental [Universal Viewer](https://github.com/universalViewer/universalviewer) page block
- [Internal] Added new "api.crowdsourcing" namespace to consolidate crowdsourcing APIs together.
- [internal] Added better debugging names for capture model slots in React devtools
- Added more APIs to `@madoc.io/types` package (still experimental) for plugins to use.
- Added page for users to see their other sites from the dashboard
- Added new option to capture model autocomplete to make an initial request
- Added filtering and ordering to site listing page

### Fixed

- Fixed bug with resolving image services on content resources without heights/widths (via [@atlas-viewer/iiif-image-api](https://github.com/atlas-viewer/iiif-image-api/commit/4fd3266426d2608bc6a7e307e92687c197bd6e8d))
- Fixed bug where "No document exists" would appear multiple times in the sidebar
- Fixed bug where logged-out user would make requests to personal notes (with a 401)
- Fixed missing annotations on model page
- Fixed message "Maximum number of contributors reached" for logged-out user
- Fixed bug where short submissions would appear collapsed in sidebar
- Fixed re-fetching on window focus
- Fixed bug where draft annotations could be seen
- Skip choice in capture model when only one option
- Fixed "Back to choices" taking the user back too far
- Fixed double button issue where "Back to choices" would appear next to "Back"
- Fixed text wrapping of "Next [entity]" and "Prev [entity]" on capture model navigation
- Added missing translation tags to "Next [entity]" and "Prev [entity]"
- Fixed i18next-react integration with capture models
- Fixed layout styling with capture model editor 
- Fixed "changes requested" notification
- Fixed missing cache-control headers on static assets
- Fixed "total collections" count when listing sites
- Fixed bug with sessions not refreshing when loading pages
- Fixed bug with cookie expire time not taking into account the refresh window
- Fixed keyboard navigation in top right menu
- Fixed broken manifest link in activity stream and exported manifests
- [internal] Fixed corrupted translation saving in development
- Fixed server-side rendering bug with dropdowns
- Fixed returning 200 status codes with no return body (changed to 204)
- Fixed scrolling overflow in admin menu
- Fixed missing title for site configuration + navigation
- Fixed title of "create site" page
- Fixed error message when sending user activation email
- Fixed bug with users being able to be created with the same email
- Fixed missing `@context` on exported Manifests
- Fixed image service (via hyperion framework)

### Removed

- Removed redundant "Back to resource" button from crowdsourcing review page
- [dev dependency] Removed unused `fork-ts-checker-webpack-plugin` package 

### Security

- Updated immer 8 -> 9 [CVE-2021-23436](https://github.com/advisories/GHSA-33f9-j839-rf8h) | [CVE-2021-3757](https://github.com/advisories/GHSA-c36v-fmgq-m8hx)
- Updated vm2 3.9.3 -> 3.9.5 [CVE-2021-23449](https://github.com/advisories/GHSA-rjf2-j2r6-q8gr)
- Updated PM2 4 -> 5 [Changelog](https://github.com/Unitech/pm2/blob/master/CHANGELOG.md#512)
- Updated BullMQ [Changelog](https://github.com/taskforcesh/bullmq/blob/master/docs/gitbook/changelog.md)
- [dev dependency] Updated Jest 26 -> 27
- [dev dependency] Updated Webpack 4 -> 5
- [dev dependency]  Updated babel
- Updated Node to latest LTS
- [dev dependency] Various security patches


## [2.0.0](https://github.com/digirati-co-uk/madoc-platform/releases/tag/v2.0.0) - 2021-10-09

First stable release of Madoc 2.0
Check out the [documentation](https://docs.madoc.io)

For [Madoc v1.x](https://github.com/digirati-co-uk/madoc-platform/tree/v1.x) you can see the [changelog](https://github.com/digirati-co-uk/madoc-platform/blob/master/CHANGELOG.md)
