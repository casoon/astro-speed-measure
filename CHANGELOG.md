# Changelog

All notable changes to this project are documented in this file. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Release dates are the npm publish
dates (UTC).

## [0.4.0] - 2026-06-23

### Added

- Astro 7 support: the peer dependency is now `^5.0.0 || ^6.0.0 || ^7.0.0`.

### Changed

- Requires Node.js 22.12.0 or later, the minimum of Astro 7.

### Fixed

- Content collection timings keep the original module id when its path has no `src` segment.

### Security

- The HTML report escapes integration, plugin, page and asset names to prevent HTML injection.

## [0.2.0] - 2026-02-25

### Added

- Astro 6 support: the peer dependency is now `^5.0.0 || ^6.0.0`.

### Breaking

- Astro 4 is no longer supported.

## [0.1.4] - 2025-12-08

### Fixed

- Integration hooks are wrapped in place, so closures shared between hooks keep working
  (required by `@astrojs/mdx`).

## [0.1.3] - 2025-12-08

### Fixed

- The Vite plugin wrapper keeps synchronous hooks synchronous, which fixes MDX transforms.

## [0.1.2] - 2025-12-08

### Fixed

- The integration hook wrapper keeps synchronous hooks such as `astro:config:done` synchronous
  for MDX compatibility.

## [0.1.0] - 2025-12-08

### Added

- Timings for Astro integration hooks and for the Vite plugin hooks `resolveId`, `load`,
  `transform` and `renderChunk`.
- Per-page, asset and content collection aggregation.
- Console, JSON and HTML output, or a custom output function.
- Comparison with the previous JSON report, build budgets and a GitHub Actions step summary.
