import { ansiToHtml } from '@casoon/pages-theme/ansi';
import type { ShowcaseExample } from '@casoon/pages-theme/showcase';
import config from '../astro.config.mjs?raw';
import capture from '../../examples/capture.json';

// Every output here comes from one real build of this site, measured by astro-speed-measure
// itself and committed by `pnpm capture` (site/scripts/capture-report.mjs).
const files = import.meta.glob<string>('../../examples/*.{ansi,json}', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const source = (file: string) => files[`../../examples/${file}`] ?? '';
const captured = `Captured on ${capture.capturedAt}: ${capture.os}, Node ${capture.node}, Astro ${capture.astro}, astro-speed-measure ${capture.astroSpeedMeasure}.`;

export const examples: ShowcaseExample[] = [
  {
    slug: 'console-report',
    title: 'Console report',
    file: 'examples/build-report.ansi',
    tags: ['output: human', 'this site'],
    description: `The report printed at the end of \`astro build\` for this site, with the default options. ${captured}`,
    input: { code: config, lang: 'js' },
    output: { html: ansiToHtml(source('build-report.ansi')), kind: 'terminal' },
  },
  {
    slug: 'json-report',
    title: 'JSON report',
    file: 'examples/build-report.json',
    tags: ['TimingReport', 'baseline'],
    description: `The same build as a \`TimingReport\`: the file written to \`outputFile\` and read back for the next comparison. ${captured}`,
    input: { code: config, lang: 'js' },
    output: { html: ansiToHtml(source('build-report.json')), kind: 'terminal' },
  },
  {
    slug: 'build-log',
    title: 'Full build log',
    file: 'examples/build-log.ansi',
    tags: ['astro build', 'context'],
    description: `The complete log of that build, so the report can be read next to Astro's own output. ${captured}`,
    input: { code: `FORCE_COLOR=1 ${capture.command}`, lang: 'shell' },
    output: { html: ansiToHtml(source('build-log.ansi')), kind: 'terminal' },
  },
];
