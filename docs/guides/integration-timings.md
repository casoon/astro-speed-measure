---
title: Reading integration timings
description: What the INTEGRATIONS section adds up, which hooks it can see, and how to find the slow one.
order: 1
---

## How integrations are timed

In its `astro:config:setup` hook, astro-speed-measure goes through `config.integrations` and
replaces every hook function of every other integration with a wrapper. The wrapper records the
time from the call until the hook returns, or until its promise settles for async hooks.
Synchronous hooks stay synchronous, and the original function is called with its own `this`, so
closures shared between hooks keep working.

## Reading a line

Each line has four columns, as in the [report of this site](../../../showcase/console-report/):

- **Name:** the integration's `name`.
- **Time:** all recorded hook calls of that integration added up.
- **Bar and percentage:** that time as a share of the total build time.

Integrations are sorted slowest first. The JSON report additionally has `count`, the number of
hook calls, and `hooks`, the time per hook name.

## Which hook is slow

Turn on `verbose` to print one `└─ <hook> <time>` line per hook under each integration, for
example for `astro:config:setup` or `astro:build:done`.

A slow `astro:config:setup` usually means expensive setup work at startup. A slow
`astro:build:done` is post-processing of the built output: sitemaps, search indexes, image or
HTML passes.

## What it cannot see

- **Hooks that ran before the wrapping.** Integrations listed before `speedMeasure()` have
  already run `astro:config:setup`. List it first.
- **Integrations added later.** An integration that another integration adds through
  `updateConfig` is not in `config.integrations` yet and is never wrapped.
- **Work outside hooks.** Anything an integration does through a Vite plugin shows up under
  [Vite plugins](../vite-timings/), not here.

## Waiting counts

An async hook's time includes everything it awaited: file system, network, child processes. A
high number means the build waited on that hook. It does not mean the hook burned that much CPU.
