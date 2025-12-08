import type {
  SpeedMeasureOptions,
  TimingReport,
  TimingSample,
} from "../types.js";
import { collectAssets } from "./asset-collector.js";
import { collectContent } from "./content-collector.js";
import type { PageCollector } from "./page-collector.js";

interface BuildReportOptions {
  samples: TimingSample[];
  totalBuildTime: number;
  pageCollector: PageCollector;
  root: string;
  options: SpeedMeasureOptions;
}

export function buildReport({
  samples,
  totalBuildTime,
  pageCollector,
  root,
  options,
}: BuildReportOptions): TimingReport {
  const integrations = summarizeCategory(samples, "integration");
  const vitePlugins = summarizeCategory(samples, "vite-plugin");
  const pageSamples = samples.filter(
    (sample) => sample.category === "vite-plugin",
  );

  const pages =
    options.measurePages !== false
      ? pageCollector.buildReport(pageSamples)
      : [];
  const assets =
    options.measureAssets !== false ? collectAssets(pageSamples, root) : [];
  const contentCollections =
    options.measureContentCollections !== false
      ? collectContent(pageSamples, root)
      : [];

  const stages = samples
    .filter((sample) => sample.category === "stage")
    .map((sample) => ({ name: sample.name, duration: sample.duration }))
    .sort((a, b) => b.duration - a.duration);

  return {
    totalBuildTime,
    integrations,
    vitePlugins,
    pages,
    assets,
    contentCollections,
    stages,
  };
}

function summarizeCategory(
  samples: TimingSample[],
  category: TimingSample["category"],
) {
  const filtered = samples.filter((sample) => sample.category === category);
  const grouped = new Map<
    string,
    {
      name: string;
      duration: number;
      count: number;
      hooks: Map<
        string,
        {
          duration: number;
          count: number;
        }
      >;
    }
  >();

  for (const sample of filtered) {
    const entry = grouped.get(sample.name) ?? {
      name: sample.name,
      duration: 0,
      count: 0,
      hooks: new Map(),
    };
    entry.duration += sample.duration;
    entry.count += 1;

    if (sample.hook) {
      const hook = entry.hooks.get(sample.hook) ?? { duration: 0, count: 0 };
      hook.duration += sample.duration;
      hook.count += 1;
      entry.hooks.set(sample.hook, hook);
    }

    grouped.set(sample.name, entry);
  }

  return Array.from(grouped.values())
    .map((entry) => ({
      name: entry.name,
      duration: entry.duration,
      count: entry.count,
      hooks: Array.from(entry.hooks.entries()).map(([name, hook]) => ({
        name,
        duration: hook.duration,
        count: hook.count,
      })),
    }))
    .sort((a, b) => b.duration - a.duration);
}
