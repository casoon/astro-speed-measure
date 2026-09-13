---
title: Reading Vite timings
description: Plugin totals, why they can exceed the build time, and how pages, assets and content collections are derived from them.
order: 2
---

## How plugins are timed

astro-speed-measure adds its own Vite plugin, `astro-speed-measure:vite`, with
`enforce: 'pre'`. In `configResolved` it wraps four hooks of every other plugin in the resolved
config:

| Hook | Module id taken from |
| --- | --- |
| `resolveId` | the import being resolved |
| `load` | the id being loaded |
| `transform` | the id being transformed |
| `renderChunk` | the chunk's facade module or file name |

Each call is recorded with the plugin name (`anonymous-plugin` if it has none), the hook and
the module id. Hooks written in Vite's object form (`{ handler, filter }`) are not functions and
are left alone, so they do not appear.

## Reading the plugin section

Plugin lines have the same columns as [integration lines](../integration-timings/#reading-a-line).
The time is the sum over all calls of that plugin, across every module. Vite runs many of
these calls at the same time, so the sums overlap: a plugin can show more time than the build
took, and the percentages across plugins can add up to more than 100 %. Read them as relative
weight, not as a slice of the wall clock.

With `verbose`, each plugin lists its time per hook, which tells you whether it is slow at
resolving, loading or transforming.

## Pages

The integration knows every route from `astro:routes:resolved` and `astro:build:setup`. A page's
time is the sum of all Vite calls whose module id starts with the page component's path: the
`.astro` file itself and its sub-modules such as extracted styles and scripts. Each line shows
the route, the type, the time and the component file.

This is compile work in Vite. It does not include rendering the page to HTML. The type column
is `ssg` (prerendered), `ssr`, `api` (endpoint) or `unknown`. Pages without matching calls
appear with `<1ms`. `topPages` sets how many are printed; the JSON report has all of them.

## Assets

Every module id outside `node_modules` is grouped by its extension: `image`, `style`,
`script`, `font`, or `other` for anything else, such as `.astro` or `.md` files. The time per
file adds up all Vite calls for it. `topAssets` sets how many are printed.

## Content collections

Module ids with a `content` path segment are grouped by the segment after it, so
`src/content/blog/post.md` counts towards `blog`. `entries` is the number of timed calls for
the collection, not the number of files; the file list (printed with `verbose`, always in the
JSON report) holds each file once. Collections that are not loaded through Vite from a
`content/` folder do not show up here.

The grouping only looks at the path, so modules of dependencies count too. In the
[report of this site](../../../showcase/console-report/), files of Astro's own content layer
(`astro/dist/content/…`) appear as collections such as `loaders` and `runtime.js`, while the
docs, which live outside `src/content/`, do not appear.
