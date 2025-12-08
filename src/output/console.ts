import pc from 'picocolors';
import type { TimingReport, SpeedMeasureOptions } from '../types.js';

export function formatReport(
  report: TimingReport,
  options: SpeedMeasureOptions,
  logger: any
): void {
  const { thresholds } = options;
  
  console.log('');
  console.log(pc.bold(pc.cyan('╔══════════════════════════════════════════════════════════════╗')));
  console.log(pc.bold(pc.cyan('║  ASTRO SPEED MEASURE - Build Performance Report              ║')));
  console.log(pc.bold(pc.cyan('╠══════════════════════════════════════════════════════════════╣')));
  console.log(pc.bold(pc.cyan(`║  Total Build Time: ${formatTime(report.totalBuildTime).padEnd(42)}║`)));
  console.log(pc.bold(pc.cyan('╚══════════════════════════════════════════════════════════════╝')));
  console.log('');
  
  if (report.integrations.length > 0) {
    console.log(pc.bold('INTEGRATIONS'));
    console.log(pc.gray('────────────────────────────────────────────────────────────────'));
    
    for (const entry of report.integrations) {
      const timeStr = formatTime(entry.duration);
      const color = getColor(entry.duration, thresholds);
      const bar = createBar(entry.duration, report.totalBuildTime);
      const percent = ((entry.duration / report.totalBuildTime) * 100).toFixed(0);
      
      console.log(`  ${color(entry.name.padEnd(24))} ${timeStr.padStart(8)}  ${bar}  ${percent}%`);
    }
    console.log('');
  }
}

function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

function getColor(duration: number, thresholds?: { green?: number; yellow?: number }) {
  const green = thresholds?.green ?? 100;
  const yellow = thresholds?.yellow ?? 1000;
  
  if (duration <= green) return pc.green;
  if (duration <= yellow) return pc.yellow;
  return pc.red;
}

function createBar(duration: number, total: number, width = 20): string {
  const percent = duration / total;
  const filled = Math.round(percent * width);
  const empty = width - filled;
  return pc.cyan('█'.repeat(filled) + '░'.repeat(empty));
}
