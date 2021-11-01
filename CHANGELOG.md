# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/digirati-co-uk/madoc-platform/compare/v2.0.0...main)

### Added

- Added support for capture model "structure" in project templates
- [internal] Added better debugging names for capture model slots in React devtools
- Missing translations for capture models
- Added support for new capture model editor in review screen
- Added ability for Admins to "reset" capture models and remove contributions

### Fixed

- Skip choice in capture model when only one option
- Fixed "Back to choices" taking the user back too far
- Fixed double button issue where "Back to choices" would appear next to "Back"
- Fixed text wrapping of "Next [entity]" and "Prev [entity]" on capture model navigation
- Added missing translation tags to "Next [entity]" and "Prev [entity]"
- Fixed i18next-react integration with capture models
- Fixed layout styling with capture model editor 
- Fixed "changes requested" notification

### Removed

- Removed redundant "Back to resource" button from crowdsourcing review page

## [2.0.0](https://github.com/digirati-co-uk/madoc-platform/releases/tag/v2.0.0) - 2021-XX-XX
First stable release of Madoc 2.0
Check out the [documentation](https://docs.madoc.io)

For [Madoc v1.x](https://github.com/digirati-co-uk/madoc-platform/tree/v1.x) you can see the [changelog](https://github.com/digirati-co-uk/madoc-platform/blob/master/CHANGELOG.md)
