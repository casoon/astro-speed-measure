import { performance } from 'node:perf_hooks';
import type { TimingCategory, TimingSample } from '../types.js';

interface Span {
  name: string;
  category: TimingCategory;
  meta?: Record<string, unknown>;
  start: number;
}

export class TimingStore {
  private samples: TimingSample[] = [];
  private spans = new Map<string, Span>();
  private counter = 0;
  private buildStart = performance.now();

  startSpan(name: string, category: TimingCategory, meta?: Record<string, unknown>): string {
    const id = `${name}-${++this.counter}`;
    this.spans.set(id, {
      name,
      category,
      meta,
      start: performance.now(),
    });
    return id;
  }

  endSpan(id: string): number {
    const span = this.spans.get(id);
    if (!span) return 0;
    const duration = performance.now() - span.start;
    this.record({
      name: span.name,
      category: span.category,
      duration,
      meta: span.meta,
      hook: typeof span.meta?.hook === 'string' ? (span.meta.hook as string) : undefined,
      detail: typeof span.meta?.detail === 'string' ? (span.meta.detail as string) : undefined,
    });
    this.spans.delete(id);
    return duration;
  }

  record(sample: TimingSample): void {
    this.samples.push(sample);
  }

  getSamples(): TimingSample[] {
    return this.samples;
  }

  resetBuildStart(): void {
    this.buildStart = performance.now();
  }

  getBuildStart(): number {
    return this.buildStart;
  }
}
