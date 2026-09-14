---
title: Quickstart
description: Build once, find the report in the log, and know which section answers which question.
order: 2
---

## Run a build

With `speedMeasure()` registered, run the production build as usual:

```sh
npx astro build
```

The integration logs `astro-speed-measure enabled` at startup. When the build is done, the
report is printed below Astro's own output.

## The sections

The report starts with a box holding the **total build time**, then prints every section that
has data:

| Section | Answers |
| --- | --- |
| `INTEGRATIONS` | Which integration's hooks took the longest? |
| `VITE PLUGINS` | Which Vite plugin spent the most time resolving, loading and transforming modules? |
| `PAGES (slowest first)` | Which page components cost the most Vite work? |
| `ASSETS (slowest first)` | Which scripts, styles, fonts and images cost the most? |
| `CONTENT COLLECTIONS` | How much time went into each collection under `content/`? |

Integration and plugin lines show the name, the time, a bar and the share of the total build
time. Times are coloured green up to 100 ms, yellow up to 1 s and red above; both limits can be
changed with `thresholds`.

The [showcase](../../../showcase/console-report/) shows this report for a real build of this
website, next to the configuration that produced it.

## Get more detail

```js
speedMeasure({ verbose: true });
```

`verbose` adds one line per hook under each integration and plugin, and the file list of each
content collection.

## Keep the numbers

Every build also writes a JSON report (see [Installation](../installation/#where-the-json-file-goes)).
On the next build, the integration logs the difference to it as
`astro-speed-measure: Previous build: <previous> -> <current> (▲<difference>)`, with `▼` when
the build got faster.

Continue with [Reading integration timings](../../guides/integration-timings/).
