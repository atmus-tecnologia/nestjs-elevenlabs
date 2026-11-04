# Changelog

Notable changes are recorded here. Versions follow Semantic Versioning.

## [1.0.0](https://github.com/atmus-tecnologia/nestjs-elevenlabs/releases/tag/v1.0.0) - 2026-11-04

### Breaking changes

- Require Node.js 22.12+ and NestJS 11 or 12; NestJS 10 is no longer supported.
- Updated upstream SDK majors may change types, defaults and resource behavior. See [MIGRATION.md](MIGRATION.md).

### Changes

- Upgrade Nest Axios and Axios; support NestJS 11/12.
- Import the HTTP module in registerAsync, fixing unresolved HttpService dependencies.
- Apply a 30-second HTTP timeout to sync and async registration.
- Build real multipart forms for voice creation/editing without mutating caller data.
- Encode voice IDs in URL segments and authenticate default settings requests.
- Correct subscription response to a single object and type audio as Buffer/Readable.
- Export public options, response models and framework-independent voice upload types.
- Replace copied documentation with package-specific installation, configuration, API and migration examples.
- Add offline regression tests, clean TypeScript builds, package-consumer validation, CI and an opt-in OIDC npm publishing workflow.
- Remove obsolete lint/release tooling, duplicate runtime peers and the shell-only deploy script.
- Publish only compiled JavaScript, declarations, source maps, documentation and license.

## 0.1.0 (2024-01-15)
