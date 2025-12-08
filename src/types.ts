import type { AstroIntegration } from 'astro';

export interface SpeedMeasureOptions {
  output?: 'human' | 'json' | 'html' | ((data: TimingReport) => void);
  outputFile?: string;
  disable?: boolean;
  measureIntegrations?: boolean;
  measureVitePlugins?: boolean;
  measurePages?: boolean;
  verbose?: boolean;
  thresholds?: {
    green?: number;
    yellow?: number;
  };
}

export interface TimingEntry {
  name: string;
  duration: number;
  hook?: string;
  count?: number;
}

export interface TimingReport {
  totalBuildTime: number;
  integrations: TimingEntry[];
  vitePlugins: TimingEntry[];
  pages: TimingEntry[];
}

export interface TimingData {
  entries: Map<string, TimingEntry[]>;
  startTime: number;
}
