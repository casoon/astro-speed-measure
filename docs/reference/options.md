---
title: Options
description: Every option of speedMeasure() with its type and default.
order: 1
---

```js
import speedMeasure from '@casoon/astro-speed-measure';

speedMeasure({
  /* options */
});
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `output` | `'human' \| 'json' \| 'html' \| (report) => void` | `'human'` | Where the report goes: console, JSON file, HTML file or your function |
| `outputFile` | `string` | `'./astro-speed-measure-report.json'` | JSON baseline and report file; for `html` the extension is switched to `.html` |
| `disable` | `boolean` | `false` | Return an empty integration |
| `measureIntegrations` | `boolean` | `true` | Wrap the hooks of the other integrations |
| `measureVitePlugins` | `boolean` | `true` | Add the Vite plugin that wraps `resolveId`, `load`, `transform`, `renderChunk` |
| `measurePages` | `boolean` | `true` | Group Vite timings by page component |
| `measureAssets` | `boolean` | `true` | Group Vite timings by asset file |
| `measureContentCollections` | `boolean` | `true` | Group Vite timings by content collection |
| `topPages` | `number` | `10` | Pages printed in the console report |
| `topAssets` | `number` | `10` | Assets printed in the console report |
| `compareWithPrevious` | `boolean` | `true` | Read the last JSON report, log the difference, write the new one |
| `budgets` | `{ totalBuild?, page?, integration?, plugin? }` | `{}` | Warn when a time in ms is exceeded |
| `ciSummary` | `boolean` | `true` | Append a summary to `GITHUB_STEP_SUMMARY` when it is set |
| `verbose` | `boolean` | `false` | Print per-hook times and content collection files |
| `thresholds` | `{ green?: number; yellow?: number }` | `{ green: 100, yellow: 1000 }` | Colour limits in ms for the console report |

Relative paths in `outputFile` resolve against the working directory of the build.

Pages, assets and content collections are derived from the Vite timings, so they stay empty
when `measureVitePlugins` is `false`.

`SpeedMeasureOptions` is exported as a type:

```ts
import type { SpeedMeasureOptions } from '@casoon/astro-speed-measure';
```
