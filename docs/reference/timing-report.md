---
title: TimingReport
description: The object behind every output mode, field by field.
order: 2
---

Every output mode is built from one `TimingReport`. The JSON file is this object, and a
function passed as `output` receives it. All durations are milliseconds.

```ts
import type { TimingReport } from '@casoon/astro-speed-measure';

speedMeasure({
  output: (report: TimingReport) => {
    console.log(`build took ${report.totalBuildTime.toFixed(0)} ms`);
  },
});
```

## Fields

| Field | Content |
| --- | --- |
| `totalBuildTime` | From the integration's `astro:config:setup` until `astro:build:done` |
| `integrations[]` | `name`, `duration`, `count` (hook calls), `hooks[]` (`name`, `duration`, `count`) |
| `vitePlugins[]` | Same shape as `integrations`, per Vite plugin |
| `pages[]` | `pathname`, `component`, `duration`, `type` (`ssg`, `ssr`, `api`, `unknown`) |
| `assets[]` | `path`, `duration`, `type` (`image`, `style`, `script`, `font`, `other`), `plugin` (first plugin seen for it) |
| `contentCollections[]` | `collection`, `duration`, `entries` (timed calls), `files[]` |
| `stages[]` | `name`, `duration` of astro-speed-measure's own build hooks |

All arrays are sorted slowest first. Unlike the console report, the JSON file is not cut off by
`topPages` or `topAssets`.

The [JSON report in the showcase](../../../showcase/json-report/) is a complete example from a
build of this website.

## Package

- npm: [@casoon/astro-speed-measure](https://www.npmjs.com/package/@casoon/astro-speed-measure)
- Types: `TimingReport`, `TimingSample` and `SpeedMeasureOptions` are exported from the package
  entry point.
- Source: [github.com/casoon/astro-speed-measure](https://github.com/casoon/astro-speed-measure)
