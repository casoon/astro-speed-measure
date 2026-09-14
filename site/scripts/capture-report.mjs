// Builds this site once and stores what astro-speed-measure reported in ../examples/, so the
// showcase shows the timing report of a real build of this very site. Run: `pnpm capture`.
import { execSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const site = path.resolve(import.meta.dirname, '..');
const repo = path.resolve(site, '..');
const examples = path.join(repo, 'examples');
const baseline = path.join(site, '.astro/speed-measure-report.json');

// Without a previous report the capture shows one build, not a comparison with the last one.
rmSync(baseline, { force: true });

// Colours on, as in an interactive terminal; stderr merged so the log keeps its order.
const command = 'astro build';
const log = execSync(`node_modules/.bin/${command} 2>&1`, {
  cwd: site,
  env: { ...process.env, FORCE_COLOR: '1' },
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});

// Absolute paths of the local checkout say nothing about the build.
const clean = (text) => text.replaceAll(`${repo}/`, '').replaceAll(repo, '.');
const plain = (line) => line.replace(/\x1b\[[0-9;]*m/g, '');

// The console report runs from its box header to the next Astro log line (timestamped).
const lines = clean(log).split('\n');
const start = lines.findIndex((line) => plain(line).startsWith('╔'));
if (start === -1) throw new Error('No astro-speed-measure report found in the build log.');
let end = lines.findIndex((line, i) => i > start && /^\d\d:\d\d:\d\d /.test(plain(line)));
if (end === -1) end = lines.length;
const report = lines.slice(start, end).join('\n').trimEnd();

const version = (name) =>
  JSON.parse(readFileSync(path.join(site, 'node_modules', name, 'package.json'), 'utf8')).version;

mkdirSync(examples, { recursive: true });
writeFileSync(path.join(examples, 'build-report.ansi'), `${report}\n`);
writeFileSync(path.join(examples, 'build-log.ansi'), `${clean(log).trimEnd()}\n`);
copyFileSync(baseline, path.join(examples, 'build-report.json'));
writeFileSync(
  path.join(examples, 'build-report.json'),
  clean(readFileSync(path.join(examples, 'build-report.json'), 'utf8')),
);
writeFileSync(
  path.join(examples, 'capture.json'),
  `${JSON.stringify(
    {
      capturedAt: new Date().toISOString().slice(0, 10),
      command,
      os: `${os.type()} ${os.release()} (${os.arch()})`,
      node: process.version,
      astro: version('astro'),
      astroSpeedMeasure: version('@casoon/astro-speed-measure'),
    },
    null,
    2,
  )}\n`,
);

console.log(`captured: ${path.relative(repo, examples)}/build-report.{ansi,json}, build-log.ansi`);
