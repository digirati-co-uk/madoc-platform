# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/digirati-co-uk/madoc-platform/compare/v2.1.0...main)

### Fixed
- Fixed bug with single line transcriptions in preview mode (NS-11)
- Fixed review screen resizer min width from 400px to 200px (NS-22)
- Fixed contributor buttons not following project config in collection (NS-23)
- Fixed missing translations in editor (NS-20)
- Fixed rejecting a submission sometimes removes accepted annotations (MAD-1315)
- Fixed allow multiple submissions when max contributions reached (MAD-1226) 
- Fixed not able to add or update annotation styles (MAD-1222)
- Fixed allow empty search (MAD-1342)
- Fixed drafts not loading for manifest model (MAD-1316)
- Fixed 'View contributions' on manifest button taking user to empty task list
- Fixed review page not showing a manifest preview for manifest tasks and showing manifest title in 'canvas' column
- Fix manifest model showing as editable for a submitted and approved manifest task
- Fixed and updated `ManifestActions` and `ManifestUserNotifications` to allow the user to continue submissions, add another and view a completed 
- Fixed only admins being able to review tasks, hide review actions if cant review (NS-17)
- Fixed autocomplete crashing (NS-28)
- Fixed infinite requests if no data when using infinite query 
- Fixed pre-process IIIF Manifest metadata and descriptive fields for validity - 3000 character max (MAD-1379)
- Fixed regex on search snippet removing 'n' instead of '\n' MAD-1386
### Added
- Added new "webhook" data model (no usages yet)
- Added more options to the footer grid block and nested fields (NS-14)
- Added notification for rejected submission and added view for rejected in contributions panel (MAD-1315)
- Ability to add custom nav items to the Global Menu block
- Added option item description to autocomplete (NS-26)
- Added required fields in capture model (MAD-211)
- Added ability to update manifest thumbnail (MAD-1314)
- Added not found pages for canvas, manifest, project and collection (MAD-1123)

### Changed
- Changed language on user dash from 'reviews' to 'review tasks' to differentiate between the two

<!-- 
### Fixed
### Added
### Changed
### Removed
-->
 

## [v2.1.0](https://github.com/digirati-co-uk/madoc-platform/compare/v2.0.8...v2.1.0)

This is a larger release and include changes to bring Madoc inline with Canvas Panel and Manifest Editor, and
supports a wider range of IIIF resources as a result.

* **🚀 Faster** - Smaller bundles and quicker page loads
* **✨ New Capture Model API** - Rewritten and simplified this will ensure any further development all happens in the same
  repository. There is a migration step, but it will also migrate on the fly as you go, so no changes required. Once we
  have verified everyone has migrated, we will remove the old service.
* **📦 New page blocks** - Lots of new page blocks have been added and extra customisation to existing ones
* **🎨 New theme options** - There are lots of new ways to customise Madoc headers/footers with page blocks or remote URLs
* **⚡️ Canvas Panel** - Madoc now uses Canvas Panel to render resources and will continue updating to view new types of
  IIIF resources while adding annotation support along the way

### Fixed

* Fixed creation of `GlobalHeader` page block slot (with `none` as the context)
* Fixed bug with loading canvases where annotations did not match the source canvas ID
* Fixed various SSR related bugs
* Fixed React key error on i18n configuration page
* Fixed bug with viewing IIIF media items
* Fixed bug where Capture model previewing in the backend would not refresh correctly
* Fixed bug where space-bar could not be used if region had not been confirmed in capture model editor
* Fixed bug with first entity selector not being revised correctly (and not saving)
* Fixed bug with capture model selectors self-referencing after being cloned
* Fixed bug with `hydrateCaptureModel` helper producing invalid entities
* Fixed missing labels when viewing "Document" in sidebar
* Fixed incorrect selector shown in "Preview" modal and "Document" sidebar.
* Fixed bug with success modal popup not always showing
* Fixed metadata page re-flowing issues on Manifest/Canvas pages
* Fixed z-index issue with the notification window being occluded
* Fixed task loading bug (incorrect cache key)
* Fixed SSR bugs relating to global header, footer and static pages (e.g. homepage)
* Fixed messaging when "Maximum number of contributors reached" instead of "This image is complete"
* Fixed z-index issue with manifest item filter
* Fixed styling of continue contributions block
* Fixed text overflow styling on review dashboard
* Fixed bug where you could not delete a project if the capture model had already been deleted
* Fixed missing structure in project export
* Fixed bug where some empty annotations were exported
* Fixed annotation format when exporting Presentation 3 Manifest (OA -> W3C)
* Fixed bug with read-only annotations disappearing
* Fixed message "login to contribute" on published projects
* Fixed notification showing on document panel when panel is empty
* Fixed bug where "choice" was not reset after making a submission
* Fixed manifest thumbnail bug where it sometimes skipped first canvas
* Fixed bug with "Start contributing" returning invalid results
* Fixed bug with "Max contributors" if user had already started working
* Fixed "Maximise window" to avoid cutting off the top section of the header
* Fixed firefox bug where "Define window" button was disabled if selector required
* Fixed Annotation styled hidden by default 
* Fixed some fields showing in submission if empty 
* Fixed email links sometimes not working in email clients - with option link to paste


### Added

* Remote header and footer support in themes [@todo provide docs]
* New Capture Model database within Madoc (previously external API)
  * Migration process integrated into Admin
  * Uses different API endpoint `/api/crowdsourcing` -> `/api/madoc/crowdsourcing`
* Added `iiif-builder` [IIIF Builder](https://github.com/IIIF-Commons/iiif-builder) from IIIF Commons
* New `CAPTURE_MODEL_API_MIGRATED` environment variable to avoid extra calls to old Capture Model API.
* Added `CanvasExplorer` capture model field type (editorial only) for selecting canvases within a Manifest context
* Added new page to Canvas admin page to see JSON representation
* Added "Download JSON" button to edit translation page in Admin
* Added support for import "remote" project templates from URL [@todo documentation / button in UI]
* New and Missing translations [@todo list]
* Added floating option to canvas status bar (green/orange/blue) styling option
* Added "Untitled" label for capture model entities without a label
* Added save on navigate away from capture model (disabled by default)
* Fixed bug with incorrect zoom on deep zoom images while navigating
* **Page blocks** - added block options for bread crumbs
* **Page blocks** - Added new "Footer Image Grid" block
* **Page blocks** - Added "Featured items" page block
* **Page blocks** - Added "Project contributors" page block
* **Page blocks** - Added full width option to IIIF Hero block
* **Page blocks** - Added lots of styling options to `Heading 1` block
* **Page blocks** - Added block options for "Single collection" block
* **Page blocks** - Added block options to "Spacer" with vertical and horizontal support
* **Page blocks** - Added block options to "Canvas Manifest pagination" block
* **Page blocks** - Added option to show both Canvas and Manifest labels in "Canvas Page Header" block
* **Page blocks** - Added new "External links" block
* **Page blocks** - Added new global footer slot to customise the footer globally
* **Page blocks** - Added inline menu options and option to hide "Homepage" in the global header
* **Page blocks** - Added block options to "Manifest actions" block
* **Page blocks** - Added block options to "Manifest canvas grid" block
* **Page blocks** - Added full width option to "Manifest hero" block
* **Page blocks** - Added block options to "Altas canvas viewer" block
* **Page blocks** - Added block options to "Pagination" block
* **Page blocks** - Added block options to "Manifest Canvas Grid" block
* **Page blocks** - Added block options to "Project Manifests" block
* **Page blocks** - Added block options to "Project Manifests" block
* **Page blocks** - Added new `project-footer` slot
* **Page blocks** - Added new block to embed items through iframe
* Added "reset error" option to attempt to recover from error states
* Added configuration option for vertical canvas zoom controls layout
* Added canvas rotation option (without annotation support)
* Added "Global font" to theme options
* Added error boundaries so only parts of a page crash (slots)
* Added error boundary to pages overridden by external plugins (to avoid crashing site, only page)
* Added extra theme options
  * option to put the black "user bar" above or below the theme header
  * Footer JS files
  * Footer inline JS
  * Header inline JS
  * Remote JS / Stylesheets in linked assets
  * HTML and "main" class names
* Added `createdAt` and `updatedAt` fields to capture models
* Added ability to create automated user types
* Added experimental Auto-review process
* Added new Export mechanism
  * Preview Manifest or Canvas exports in the Admin
  * Run a large project export as a background task and download a zip at the end
  * Supported exports:
    * Canvas API - A JSON document with each canvas from the API
    * Manifest API - A JSON document with each manifest from the API
    * Canvas model export - Export full raw capture models for each canvas
    * Canvas plaintext - export plaintext transcriptions for each document
    * Canvas annotation export - a JSON document with the output of each canvas annotations (w3c/oa/json)
    * Project API - A JSON document with project metadata
    * Simple CSV export - exports all capture models into a csv file.
* Added new interactions in the Document panel for annotations
* Added secondary view for "X hours ago" to show the date and time on click (browser preference)
* Added "Generate PDF" option for manifests using [pdiiif](https://pdiiif.jbaiter.de/) from (@jbaiter - [Repository](https://github.com/jbaiter/pdiiif))
* Added small indication under choices in the capture model UI with number of previous submissions
* Added new auto-complete endpoints migrated from Madoc 1.x
  * [searchFAST](http://fast.oclc.org/searchfast/)
  * [WikiData](https://www.wikidata.org)
* Added more Dutch translations (Thanks Davy Verbeke)

### Changed

* Node updated from 14 -> 18
* PM2 update from 4.x -> 5.x
* When creating a capture model revision in "edit mode" empty entities will be "forked" if allowMultiple=true
* Removed IIIF-Builder code and use published module (`iiif-builder` on NPM)
* Capture Model API endpoint `/api/crowdsourcing` -> `/api/madoc/crowdsourcing`
* Updated IIIF/Hyperion dependencies
  * `@atlas-viewer/atlas` [@todo use published version]
  * `@hyperion-framework/types` -> `@iiif/presentation-3`
  * `@hyperion-framework/presentation-2` -> `@iiif/presentation-2`
  * `@hyperion-framework/parser` -> `@iiif/parser`
  * `@hyperion-framework/vault` -> `@iiif/vault`
  * `@hyperion-framework/store` removed
  * `@hyperion-framework/react-vault` -> `react-iiif-vault`
* Updated `react-i18next` updated from `11.7.2` to `11.18.4`
* Updated React Router to 6.4 [@todo update to stable]
* `CollectionExplorer` capture model field type (editorial only) now uses smaller thumbnails
* Default query config from `refetchOnMount: true` to `refetchOnMount: 'always'`
* Changed Canvas/Manifest/Collection grids to
  use [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
* `useLayoutEffect` -> `useBrowserLayoutEffect` to try and fix SSR warnings
* CSS - Reduced box-shadows in capture model editor forms
* Changed all Atlas Viewer instances to use Canvas panel
* Simplified styling on search results
* Improved reviewer dashboard view 
  * Sortable table headers 
  * Resizable layout 
  * Full row clickable 
  * Focus mode & edit added
  * Clearer language 
  * Side by side canvas preview and improved styling 
  * Navigation between items in list 
  * Default to no selected task
  * Added infinite scroll

### Removed

* Removed external Capture Model API
* Removed `AutoSelectDefineRegion` behaviour from capture model editor

### Security

* Pinned `ws` from `7.4.6` -> `8.8.0`

### Development

* Migrated build from Webpack to Vite
  * Split server builds (auth/queue/producer/server)
  * Added hot module reloading
  * Better module splitting in production (-70% bundle size)
  * Visual indicator that JS is still bundling in development
* Add HTTPS option for local development
* Helper scripts now have `.cjs` or `.mjs` extensions
* Consolidated all File paths to `services/madoc-ts/src/paths`
* Consolidated all environment variables to `services/madoc-ts/src/paths`
* Changed all `const { push } = useHistory()` to `const navigate = useNavigate()` (React Router upgrade)
* Change all `renderUniversalRoutes(...)` to `<Outlet />` (React Router upgrade)
* Change all `api.getIsServer()` checks to `<BrowserComponent />` wrapper (React router upgrade)
* Change all `<Redirect />` to `<Navigate />` (React router upgrade)
* Fork of `RegionHighlight`, `ResizeWorldItem` from Atlas viewer (may be removed in future)
* Capture model helper `captureModelShorthandText` for creating test fixtures (with values)
* Removed almost all external modules made available to plugins (breaks code-splitting,
  see [use-module.ts](https://github.com/digirati-co-uk/madoc-platform/blob/09d566aa4560dc72b878db089b4e1b834c608ed7/services/madoc-ts/src/frontend/shared/plugins/use-module.ts))
* Move Api keys database code to `ApiKeyRepository`
* Added flags that can be passed into the `BaseRepository` class
* Split out `ViewDocument` into more manageable components 

## [2.0.8](https://github.com/digirati-co-uk/madoc-platform/releases/tag/v2.0.8) - 2022-08-24

### Added

- Additional Welsh translations (@NLW-paulm)

## [2.0.7](https://github.com/digirati-co-uk/madoc-platform/releases/tag/v2.0.7) - 2022-05-18

This is a hot fix release.

## [2.0.6](https://github.com/digirati-co-uk/madoc-platform/releases/tag/v2.0.6) - 2022-05-16

This is a hot fix release.

### Fixed

- Fixed cache invalidation bug on Admin
- Reverted change to cache time on FireFox
- Fixed invalid translations for static models
- Missing translations for configuration
- New configuration for pooled connections
- Fixed query string language config

## [2.0.5](https://github.com/digirati-co-uk/madoc-platform/releases/tag/v2.0.5) - 2022-05-06

### Added

- Added new alternative review page
- Added configuration for enabling "Merging"
- Added configuration for hiding/showing annotations on model and canvas page
- Added configuration for hiding/showing document regions on model and canvas page
- Added new Annotation styles for customising colors and borders of annotations
- Added new zoom controls
- Enabled new project template hook: `beforeCloneModel`
- Enabled new project template hook: `onRevisionApproved`
- Added support for Manifest capture models (only through project templates)
- Added configuration for background
- Added configuration for annotation hotspots
- **Experimental**: New capture model
  translations ([feedback](https://github.com/digirati-co-uk/madoc-platform/discussions/567))

### Fixed

- Regression with dropdown (reverts fix for overflow bug in popup)
- Fist selection on reviewer dashboard
- Fixed caching on languages
- Fixed rendering bugs with annotations
- Fixed cache time bug in Firefox
- Fixed vertical alignment of breadcrumbs

### Changed

- Updated react query to latest 2.x version (3.x is a breaking change)

## [2.0.4](https://github.com/digirati-co-uk/madoc-platform/releases/tag/v2.0.4) - 2022-03-22

### Fixed

- Fixed OCR page linking from menu
- Fixed missing OCR listed
- Styling of "Suggest edit" to be clearer
- Styling of "Breadcrumbs" and labelling
- Fixed default selected field "type" - it is now "text-field" making models quicker to create
- Fixed issue where you could not de-select an entity selector
- Fixed auto-selecting the "define" region when using editing an existing region
- Fixed error generating transcription from empty capture model (paragraphs).
- Fixed importing canvases (empty image service)

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
- Added configuration to hide "next canvas" when preview is disabled
- Added "tiny" variation of image wrapper [dev]
- Added preview for entity lists using selector if it's available
- Added "confirm" to deselect or confirm the current selector
- Added support for API calls as part of a page block (with server rendering) [dev]
- Added "Single project" page block
- Added "color" field for capture models
- Added "Single collection" page block
- Added "project explorer" capture model field (page blocks only)
- Added "collection explorer" capture model field (page blocks only)

### Changed

- The link in the top bar now always links to the site (previously the admin for admins).
- Changed size of the footer, minimised size
- Changed position of menu items in Admin to be more logical
- Split Add and Import collection pages, reflected in navigation
- Swapped manifests / collections order in admin
- Moved `<DocumentPreview />` from capture models to this repo
- Moved `@capture-models/*` packages into this repo (
  See [#529](https://github.com/digirati-co-uk/madoc-platform/pull/529))
- Changed back to choices styling
- Changed order of projects (the newest first)
- Updated Atlas to 2.0

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
- Fixed typo in language files

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
