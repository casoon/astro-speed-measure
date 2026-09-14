---
title: Overview
description: What astro-speed-measure measures, where its numbers come from, and how this documentation is organised.
order: 0
---

astro-speed-measure is an Astro integration that times a production build from the inside. It
wraps the hooks of the other integrations in your config and the hooks of every Vite plugin,
then prints a report when `astro:build:done` runs.

## What it measures

- **Integrations:** time spent in each hook of each integration, summed per integration.
- **Vite plugins:** time spent in `resolveId`, `load`, `transform` and `renderChunk`, summed per
  plugin.
- **Pages, assets and content collections:** the same Vite timings, grouped by the module they
  worked on.
- **Total build time:** from the moment astro-speed-measure is set up until `astro:build:done`.

The report goes to the console, a JSON file, an HTML file or your own function. The JSON file
doubles as a baseline for the next build.

## Where it stops

astro-speed-measure measures wall-clock time around hooks. It is not a CPU profiler: an async
hook's time includes everything it waited for, and Vite runs many hooks in parallel, so plugin
totals can add up to more than the total build time. Hooks declared in Vite's object form
(`{ handler }`) are not wrapped and do not appear in the report.

## This documentation

- [Installation](getting-started/installation/) and [Quickstart](getting-started/quickstart/)
  get the first report on screen.
- [Reading integration timings](guides/integration-timings/) and
  [Reading Vite timings](guides/vite-timings/) explain each section of the report.
- [Baselines, budgets and CI](guides/ci-and-budgets/) covers the JSON baseline, warnings and
  the GitHub Actions summary.
- [Options](reference/options/) and [TimingReport](reference/timing-report/) list every option and
  field.

The [showcase](../showcase/) shows the report of a real build of this website.
