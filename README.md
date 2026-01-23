# astro-speed-measure

Measure Astro build performance end-to-end. Wraps integrations and Vite plugins, aggregates per-page and asset timings, and emits human, JSON, or HTML reports.

Inspired by [speed-measure-webpack-plugin](https://github.com/stephencookdev/speed-measure-webpack-plugin).

## Features
- Track Astro integration hooks.
- Time Vite plugin `resolveId`, `load`, `transform`, and `renderChunk`.
- Aggregate per-page timing (SSG/SSR/API), asset timing (scripts, styles, images, fonts), and content collection work.
- Output to console, JSON, or HTML; keep a JSON baseline for comparisons.
- Budgets and CI summary (GitHub Actions `GITHUB_STEP_SUMMARY`).

## Installation

```bash
npm install @casoon/astro-speed-measure
```

## Quick start

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import speedMeasure from '@casoon/astro-speed-measure';

export default defineConfig({
  integrations: [
    speedMeasure({
      output: 'human',           // 'human' | 'json' | 'html' | function
      outputFile: './metrics.json',
      measurePages: true,
      measureAssets: true,
      measureContentCollections: true,
      compareWithPrevious: true, // keep JSON for trend comparison
      budgets: {
        totalBuild: 15000,       // ms thresholds for warnings
        page: 500,
        integration: 1000,
        plugin: 750,
      },
      verbose: false,
    }),
  ],
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `output` | `'human' \| 'json' \| 'html' \| Function` | `'human'` | Output mode |
| `outputFile` | `string` | `./astro-speed-measure-report.json` | Baseline file for JSON/HTML |
| `disable` | `boolean` | `false` | Disable measurement |
| `measureIntegrations` | `boolean` | `true` | Measure Astro integrations |
| `measureVitePlugins` | `boolean` | `true` | Measure Vite plugins (resolve/load/transform/renderChunk) |
| `measurePages` | `boolean` | `true` | Aggregate per-page timings based on plugin transforms |
| `measureAssets` | `boolean` | `true` | Collect timings for CSS/JS/fonts/images |
| `measureContentCollections` | `boolean` | `true` | Collect timings for `src/content/*` |
| `topPages` | `number` | `10` | Number of slowest pages to print |
| `topAssets` | `number` | `10` | Number of slowest assets to print |
| `compareWithPrevious` | `boolean` | `true` | Compare against last JSON report |
| `budgets` | `object` | `{}` | Warn when build/page/integration/plugin exceeds budget (ms) |
| `ciSummary` | `boolean` | `true` | Write summary to `GITHUB_STEP_SUMMARY` when available |
| `verbose` | `boolean` | `false` | Show hook-level detail |
| `thresholds` | `{ green?: number; yellow?: number }` | `{ green: 100, yellow: 1000 }` | Console coloring thresholds |

## Outputs

- **Console**: human-friendly table with colored bars; add `verbose: true` for hook-level detail.
- **JSON**: persisted timing report for trend comparisons.
- **HTML**: standalone report with tables for integrations, plugins, pages, assets, and content.

## Usage Examples

### Minimal Setup

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import speedMeasure from 'astro-speed-measure';

export default defineConfig({
  integrations: [speedMeasure()],
});
```

### JSON Report for CI Pipelines

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import speedMeasure from 'astro-speed-measure';

export default defineConfig({
  integrations: [
    speedMeasure({
      output: 'json',
      outputFile: './build-metrics.json',
      ciSummary: true, // writes to GITHUB_STEP_SUMMARY
    }),
  ],
});
```

### HTML Report for Detailed Analysis

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import speedMeasure from 'astro-speed-measure';

export default defineConfig({
  integrations: [
    speedMeasure({
      output: 'html',
      outputFile: './speed-report.html',
      topPages: 20,
      topAssets: 20,
    }),
  ],
});
```

### Build Budgets with Warnings

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import speedMeasure from 'astro-speed-measure';

export default defineConfig({
  integrations: [
    speedMeasure({
      budgets: {
        totalBuild: 30000,  // warn if total build exceeds 30s
        page: 1000,         // warn if any page exceeds 1s
        integration: 2000,  // warn if any integration exceeds 2s
        plugin: 1500,       // warn if any plugin exceeds 1.5s
      },
    }),
  ],
});
```

### Custom Output Handler

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import speedMeasure from 'astro-speed-measure';

export default defineConfig({
  integrations: [
    speedMeasure({
      output: (report) => {
        // Send metrics to external service
        fetch('https://metrics.example.com/api/build', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
        });
      },
    }),
  ],
});
```

### Verbose Mode for Debugging

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import speedMeasure from 'astro-speed-measure';

export default defineConfig({
  integrations: [
    speedMeasure({
      verbose: true,           // show hook-level details
      measurePages: true,
      measureAssets: true,
      measureContentCollections: true,
    }),
  ],
});
```

### Disable in Development

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import speedMeasure from 'astro-speed-measure';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  integrations: [
    speedMeasure({
      disable: !isProd, // only measure in production builds
    }),
  ],
});
```

### Trend Comparison

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import speedMeasure from 'astro-speed-measure';

export default defineConfig({
  integrations: [
    speedMeasure({
      output: 'human',
      outputFile: './metrics-baseline.json',
      compareWithPrevious: true, // compare against last run
    }),
  ],
});
```

### Focus on Specific Metrics

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import speedMeasure from 'astro-speed-measure';

export default defineConfig({
  integrations: [
    speedMeasure({
      measureIntegrations: true,
      measureVitePlugins: false,  // skip Vite plugin timing
      measurePages: true,
      measureAssets: false,       // skip asset timing
      measureContentCollections: false,
    }),
  ],
});
```

## License

MIT
