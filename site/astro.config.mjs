// @ts-check
import speedMeasure from '@casoon/astro-speed-measure';
import casoonPages from '@casoon/pages-theme';
import { defineConfig } from 'astro/config';

// Project page: https://casoon.github.io/astro-speed-measure/ — `base` is the GitHub Pages path.
export default defineConfig({
  site: 'https://casoon.github.io/astro-speed-measure',
  base: '/astro-speed-measure/',
  integrations: [
    // Dogfooding: every build of this site is measured. Listed first so it can wrap the hooks
    // of the integrations after it. The baseline lives in the git-ignored .astro/ folder;
    // `pnpm capture` copies the report of one build into examples/ for the showcase.
    speedMeasure({
      outputFile: './.astro/speed-measure-report.json',
    }),
    casoonPages({
      name: 'astro-speed-measure',
      description:
        'Build performance metrics for Astro: integration hooks, Vite plugins, pages, assets and content collections.',
      repo: 'casoon/astro-speed-measure',
      version: '0.4.0',
      license: 'MIT',
      packages: [
        { label: 'npm', href: 'https://www.npmjs.com/package/@casoon/astro-speed-measure' },
      ],
      docsGroups: {
        'getting-started': 'Getting started',
        guides: 'Guides',
        reference: 'Reference',
      },
    }),
  ],
});
