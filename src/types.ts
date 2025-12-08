export type OutputMode =
  | "human"
  | "json"
  | "html"
  | ((data: TimingReport) => void);

export interface SpeedMeasureOptions {
  output?: OutputMode;
  outputFile?: string;
  disable?: boolean;
  measureIntegrations?: boolean;
  measureVitePlugins?: boolean;
  measurePages?: boolean;
  measureAssets?: boolean;
  measureContentCollections?: boolean;
  verbose?: boolean;
  topPages?: number;
  topAssets?: number;
  compareWithPrevious?: boolean;
  ciSummary?: boolean;
  budgets?: {
    totalBuild?: number;
    page?: number;
    integration?: number;
    plugin?: number;
  };
  thresholds?: {
    green?: number;
    yellow?: number;
  };
}

export type TimingCategory =
  | "integration"
  | "vite-plugin"
  | "page"
  | "asset"
  | "content"
  | "stage";

export interface TimingSample {
  category: TimingCategory;
  name: string;
  duration: number;
  hook?: string;
  detail?: string;
  meta?: Record<string, unknown>;
}

export interface HookTiming {
  name: string;
  duration: number;
  count: number;
}

export interface IntegrationTiming {
  name: string;
  duration: number;
  count: number;
  hooks: HookTiming[];
}

export interface PluginTiming {
  name: string;
  duration: number;
  count: number;
  hooks: HookTiming[];
}

export type PageRenderType = "ssg" | "ssr" | "api" | "unknown";

export interface PageTiming {
  pathname: string;
  component: string;
  duration: number;
  type: PageRenderType;
}

export type AssetType = "image" | "style" | "script" | "font" | "other";

export interface AssetTiming {
  path: string;
  duration: number;
  type: AssetType;
  plugin?: string;
}

export interface ContentTiming {
  collection: string;
  duration: number;
  entries: number;
  files: string[];
}

export interface StageTiming {
  name: string;
  duration: number;
}

export interface TimingReport {
  totalBuildTime: number;
  integrations: IntegrationTiming[];
  vitePlugins: PluginTiming[];
  pages: PageTiming[];
  assets: AssetTiming[];
  contentCollections: ContentTiming[];
  stages: StageTiming[];
}

export interface PageInfo {
  pathname: string;
  component: string;
  renderType: PageRenderType;
}
