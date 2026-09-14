---
title: Baselines, budgets and CI
description: Compare with the previous build, warn when a limit is exceeded, and get a summary in GitHub Actions.
order: 3
---

## Baseline comparison

With `compareWithPrevious: true` (the default) the integration reads the JSON report at
`outputFile` before writing the new one, and logs the difference in total build time as
`astro-speed-measure: Previous build: <previous> -> <current> (▲<difference>)`, with `▼` when
the build got faster.

The file is written for every output mode except a custom function. A `.html` `outputFile` is
paired with a `.json` file of the same name for the baseline.

In CI the working directory starts empty, so there is no previous report unless you restore it,
for example from a cache or an artifact of the last build on the default branch.

## Budgets

```js
speedMeasure({
  budgets: {
    totalBuild: 30000, // ms
    integration: 2000,
    plugin: 1500,
    page: 1000,
  },
});
```

Each exceeded budget logs a warning in the form
`astro-speed-measure: Vite plugin "<name>" took <time> (budget <budget>)`, and likewise for the
total build time, integrations and pages.

`integration`, `plugin` and `page` apply to every single integration, plugin and page. Budgets
warn only; the build does not fail.

## GitHub Actions step summary

When `GITHUB_STEP_SUMMARY` is set, the integration appends a short Markdown summary to it: the
total build time and the slowest integration, Vite plugin and page. It shows up on the run's
summary page. Set `ciSummary: false` to skip it.

## JSON for your own pipeline

```js
speedMeasure({
  output: 'json',
  outputFile: './build-metrics.json',
});
```

The file contains the full [report](../../reference/timing-report/). Upload it as an artifact, or pass
a function as `output` to send the report wherever you need it.
