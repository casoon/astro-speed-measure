import fs from "node:fs/promises";
import type { AstroIntegration } from "astro";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { PageCollector } from "./collectors/page-collector.js";
import { buildReport } from "./collectors/report.js";
import { wrapIntegrationInPlace } from "./hooks/wrap-integrations.js";
import { formatReport } from "./output/console.js";
import { writeCiSummary } from "./output/ci.js";
import { writeHtmlReport } from "./output/html-report.js";
import { writeJsonReport } from "./output/json.js";
import type { SpeedMeasureOptions, TimingReport } from "./types.js";
import { TimingStore } from "./utils/timing.js";
import { createTimingVitePlugin } from "./vite-plugin.js";

const defaultOptions: Required<SpeedMeasureOptions> = {
  output: "human",
  outputFile: "./astro-speed-measure-report.json",
  disable: false,
  measureIntegrations: true,
  measureVitePlugins: true,
  measurePages: true,
  measureAssets: true,
  measureContentCollections: true,
  verbose: false,
  topPages: 10,
  topAssets: 10,
  compareWithPrevious: true,
  ciSummary: true,
  budgets: {},
  thresholds: {
    green: 100,
    yellow: 1000,
  },
};

export function createSpeedMeasureIntegration(
  userOptions: SpeedMeasureOptions = {},
): AstroIntegration {
  const options = { ...defaultOptions, ...userOptions };
  const store = new TimingStore();
  const pageCollector = new PageCollector();
  let root = process.cwd();
  let totalStart = performance.now();

  if (options.disable) {
    return { name: "astro-speed-measure", hooks: {} };
  }

  const timeStage = (name: string) =>
    store.startSpan(name, "stage", { hook: name });

  return {
    name: "astro-speed-measure",
    hooks: {
      "astro:config:setup": ({ config, updateConfig, logger }) => {
        root = fileURLToPath(config.root);
        pageCollector.setRoot(root);
        store.resetBuildStart();
        totalStart = store.getBuildStart();

        if (options.measureIntegrations) {
          // Wrap hooks in-place to preserve closure bindings (important for MDX)
          for (const integration of config.integrations) {
            if (integration.name === "astro-speed-measure") continue;
            wrapIntegrationInPlace(integration, store);
          }
        }

        if (options.measureVitePlugins) {
          updateConfig({
            vite: {
              plugins: [createTimingVitePlugin(store)],
            },
          });
        }

        const stage = timeStage("astro:config:setup");
        logger.info("astro-speed-measure enabled");
        store.endSpan(stage);
      },

      "astro:routes:resolved": ({ routes }) => {
        pageCollector.setRoutes(routes);
      },

      "astro:build:setup": ({ pages }) => {
        const stage = timeStage("astro:build:setup");
        pageCollector.setPagesFromBuild(pages as Map<string, any>);
        store.endSpan(stage);
      },

      "astro:build:start": () => {
        const stage = timeStage("astro:build:start");
        store.endSpan(stage);
      },

      "astro:build:ssr": () => {
        const stage = timeStage("astro:build:ssr");
        store.endSpan(stage);
      },

      "astro:build:generated": () => {
        const stage = timeStage("astro:build:generated");
        store.endSpan(stage);
      },

      "astro:build:done": async ({ logger }) => {
        const stage = timeStage("astro:build:done");
        const totalBuildTime = performance.now() - totalStart;
        const jsonPath = resolveJsonPath(options.outputFile);
        const htmlPath = resolveHtmlPath(options.outputFile);
        const previousReport =
          options.compareWithPrevious && jsonPath
            ? await readPreviousReport(jsonPath)
            : null;

        const report: TimingReport = buildReport({
          samples: store.getSamples(),
          totalBuildTime,
          pageCollector,
          root,
          options,
        });

        let jsonWritten = false;

        if (options.output === "human") {
          formatReport(report, options, logger);
        } else if (options.output === "json") {
          await writeJsonReport(report, jsonPath, logger);
          jsonWritten = true;
        } else if (options.output === "html") {
          await writeHtmlReport(report, htmlPath, logger);
        } else if (typeof options.output === "function") {
          options.output(report);
        }

        const shouldPersistJson =
          options.compareWithPrevious || options.output === "json";
        if (shouldPersistJson && jsonPath && !jsonWritten) {
          await writeJsonReport(report, jsonPath, logger);
        }

        if (previousReport) {
          logComparison(previousReport, report, logger);
        }

        enforceBudgets(report, options, logger);
        if (options.ciSummary !== false) {
          await writeCiSummary(report);
        }

        store.endSpan(stage);
      },
    },
  };
}

function resolveJsonPath(outputFile?: string): string {
  if (!outputFile) return "./astro-speed-measure-report.json";
  if (outputFile.endsWith(".json")) return outputFile;
  if (outputFile.endsWith(".html"))
    return outputFile.replace(/\.html$/, ".json");
  return `${outputFile}.json`;
}

function resolveHtmlPath(outputFile?: string): string {
  if (!outputFile) return "./astro-speed-measure-report.html";
  if (outputFile.endsWith(".html")) return outputFile;
  if (outputFile.endsWith(".json"))
    return outputFile.replace(/\.json$/, ".html");
  return `${outputFile}.html`;
}

async function readPreviousReport(path: string): Promise<TimingReport | null> {
  try {
    const raw = await fs.readFile(path, "utf8");
    return JSON.parse(raw) as TimingReport;
  } catch {
    return null;
  }
}

function logComparison(
  previous: TimingReport,
  current: TimingReport,
  logger?: any,
): void {
  const diff = current.totalBuildTime - previous.totalBuildTime;
  const symbol = diff >= 0 ? "▲" : "▼";
  const message = `Previous build: ${formatMs(previous.totalBuildTime)} -> ${formatMs(current.totalBuildTime)} (${symbol}${formatMs(Math.abs(diff))})`;
  logger?.info?.(`astro-speed-measure: ${message}`);
}

function enforceBudgets(
  report: TimingReport,
  options: SpeedMeasureOptions,
  logger?: any,
): void {
  const budgets = options.budgets;
  if (!budgets) return;

  const warn = (message: string) =>
    logger?.warn?.(`astro-speed-measure: ${message}`);

  if (budgets.totalBuild && report.totalBuildTime > budgets.totalBuild) {
    warn(
      `Total build time ${formatMs(report.totalBuildTime)} exceeded budget ${formatMs(budgets.totalBuild)}`,
    );
  }

  if (budgets.integration) {
    const offenders = report.integrations.filter(
      (integration) => integration.duration > budgets.integration!,
    );
    offenders.forEach((integration) =>
      warn(
        `Integration "${integration.name}" took ${formatMs(integration.duration)} (budget ${formatMs(budgets.integration!)})`,
      ),
    );
  }

  if (budgets.plugin) {
    const offenders = report.vitePlugins.filter(
      (plugin) => plugin.duration > budgets.plugin!,
    );
    offenders.forEach((plugin) =>
      warn(
        `Vite plugin "${plugin.name}" took ${formatMs(plugin.duration)} (budget ${formatMs(budgets.plugin!)})`,
      ),
    );
  }

  if (budgets.page) {
    const offenders = report.pages.filter(
      (page) => page.duration > budgets.page!,
    );
    offenders.forEach((page) =>
      warn(
        `Page "${page.pathname}" took ${formatMs(page.duration)} (budget ${formatMs(budgets.page!)})`,
      ),
    );
  }
}

function formatMs(ms: number): string {
  if (ms < 1) return "<1ms";
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
