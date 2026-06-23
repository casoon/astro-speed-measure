import fs from "node:fs/promises";
import type { TimingReport } from "../types.js";
import { formatMs } from "../utils/format.js";

export async function writeCiSummary(report: TimingReport): Promise<void> {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;

  const topIntegration = report.integrations[0];
  const topPlugin = report.vitePlugins[0];
  const topPage = report.pages[0];

  const lines = [
    "## Astro Speed Measure",
    "",
    `- Total build: **${formatMs(report.totalBuildTime)}**`,
    topIntegration
      ? `- Slowest integration: **${topIntegration.name}** (${formatMs(topIntegration.duration)})`
      : "- Slowest integration: n/a",
    topPlugin
      ? `- Slowest Vite plugin: **${topPlugin.name}** (${formatMs(topPlugin.duration)})`
      : "- Slowest Vite plugin: n/a",
    topPage
      ? `- Slowest page: **${topPage.pathname}** (${formatMs(topPage.duration)})`
      : "- Slowest page: n/a",
    "",
  ];

  await fs.appendFile(summaryPath, `${lines.join("\n")}\n`, "utf8");
}

