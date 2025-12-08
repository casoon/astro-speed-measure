# astro-speed-measure

Build performance metrics for Astro - measure integration, plugin, and page generation times.

Inspired by [speed-measure-webpack-plugin](https://github.com/stephencookdev/speed-measure-webpack-plugin).

## Installation

```bash
npm install astro-speed-measure
```

## Usage

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import speedMeasure from 'astro-speed-measure';

export default defineConfig({
  integrations: [
    speedMeasure({
      output: 'human',  // 'human' | 'json' | function
      verbose: false,
    }),
    // your other integrations...
  ],
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `output` | `'human' \| 'json' \| Function` | `'human'` | Output format |
| `outputFile` | `string` | - | File path for JSON output |
| `disable` | `boolean` | `false` | Disable measurement |
| `measureIntegrations` | `boolean` | `true` | Measure integration timing |
| `measureVitePlugins` | `boolean` | `true` | Measure Vite plugin timing |
| `measurePages` | `boolean` | `true` | Measure page generation |
| `verbose` | `boolean` | `false` | Show detailed statistics |
| `thresholds` | `object` | `{ green: 100, yellow: 1000 }` | Color thresholds in ms |

## License

MIT
