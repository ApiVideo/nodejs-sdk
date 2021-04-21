# Changelog
All changes to this project will be documented in this file.

## [1.10.3] - 2021-04-21
Fix upload requests which were hanging forever when called without an `Authorization` header.
> Thanks to @beurnii for the report

## [1.10.2] - 2021-02-19
- Add `public` property to a `Live`

## [1.10.1] - 2021-02-09
- Add an `ApiVideoError` custom error
  - This error object now exposes the `problemDetails` object
> see https://docs.api.video/docs/problem-details for more details on possible errors

## [1.10.0] - 2021-02-09
- Allow optional `ttl` parameter in `client.tokens.generate`

## [1.9.8] - 2021-02-09
- Replace `request` library with `got`
  - Fix issues related to the `lastRequest` paradigm (#6, #16)
- Add sandbox testing file `API_KEY=xxx npm run test:sandbox`

## [1.8.8] - 2021-02-04
- Deprecate methods using endpoints unavailable in the current API:
  - `analyticsLive.search`
  - `analytics.search`
- Deprecate `accounts.get`

## [1.8.7] - 2021-01-18
- Add missing analyticData.session.metadata for live videos
- Fix upload of large video files
- Add "User Agent" header in requests

## [1.8.6] - 2021-01-15
- Add missing analyticData.session.metadata

## [1.8.5] - 2020-10-06
- Read chunks directly from source

## [1.8.4] - 2020-07-20
- Fix/failing test cases
- Chore/reduce cast all duplication
- chore: Add missing tests

## [1.8.3] - 2020-06-18
- remove reference to npm

## [1.8.2] - 2019-01-23
- remove unused language property on Player Model

## [1.8.1] - 2019-01-16
- add Features to Account model

## [1.8.0] - 2019-01-16
- add Account support

## [1.7.0] - 2019-01-15
- delete player logo method

## [1.6.0] - 2019-01-15
- Chapters support

## [1.5.0] - 2019-12-18
- Player logo support

## [1.4.0] - 2019-11-29
- Panoramic support
- Mp4 support
- Video Status support

## [1.3.0] - 2019-07-22
- Refactoring Analytics models
- Add AnalyticsSessionEvent resource

## [1.2.0] - 2019-07-19
- Replace old authentication rounting

## [1.1.0] - 2019-06-21
- Constructors for production and sandbox environments

## [1.0.3] - 2019-02-08
### Changed
- Fix Chunked upload

## [1.0.2] - 2019-01-11
### Changed
- Fix Authentication

## [1.0.1] - 2019-01-11
### Changed
- Refactoring

## [1.0.0] - 2019-01-09
### Added
- Authentication
- Videos resources
- Players resources
- Tokens resources
- Lives resources
- Captions resources
- Analytics Videos resources
- Analytics Lives resources
