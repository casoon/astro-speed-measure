---
title: Installation
description: Add the package to an Astro 5, 6 or 7 project and register the integration.
order: 1
---

## Requirements

- Astro `^5.0.0`, `^6.0.0` or `^7.0.0` (peer dependency).
- Node.js 22.12.0 or later.

## Install the package

```sh
npm install @casoon/astro-speed-measure
# or
pnpm add @casoon/astro-speed-measure
```

The package has one runtime dependency, `picocolors`, for the coloured console output.

## Register the integration

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import speedMeasure from '@casoon/astro-speed-measure';

export default defineConfig({
  integrations: [
    speedMeasure(),
    // your other integrations
  ],
});
```

List `speedMeasure()` first. It wraps the other integrations when its own `astro:config:setup`
hook runs, so an integration listed before it has already run its `astro:config:setup` by then,
and that hook is not timed. Integrations that another integration adds later through
`updateConfig` are not wrapped at all.

## Where the JSON file goes

With the default options, every build writes `astro-speed-measure-report.json` to the working
directory of the build, because `compareWithPrevious` keeps the last report for a comparison.
Add the file to `.gitignore`, or move it somewhere ignored already:

```js
speedMeasure({
  outputFile: './.astro/speed-measure-report.json',
});
```

This website uses exactly that line.

## Turning it off

The report is produced in `astro:build:done`, so `astro dev` never prints one, but the hook
wrappers are still installed. `disable: true` returns an empty integration instead, for
example driven by an environment variable of your choice:

```js
speedMeasure({ disable: process.env.SPEED_MEASURE === 'off' });
```

Next: [Quickstart](../quickstart/).
