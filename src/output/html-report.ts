import fs from "node:fs/promises";
import type { TimingReport } from "../types.js";
import { formatMs } from "../utils/format.js";

export async function writeHtmlReport(
  report: TimingReport,
  outputFile = "./astro-speed-measure-report.html",
  logger?: any,
): Promise<void> {
  const html = createHtml(report);
  await fs.writeFile(outputFile, html, "utf8");
  logger?.info?.(`astro-speed-measure: wrote HTML report to ${outputFile}`);
}

function createHtml(report: TimingReport): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Astro Speed Measure Report</title>
  <style>
    :root {
      --bg: #0f172a;
      --panel: #111827;
      --text: #e5e7eb;
      --muted: #9ca3af;
      --accent: #38bdf8;
      --warn: #f59e0b;
      --danger: #f87171;
      --success: #34d399;
      --mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    }
    body {
      background: radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.08), transparent 25%),
                  radial-gradient(circle at 80% 0%, rgba(244, 114, 182, 0.08), transparent 25%),
                  var(--bg);
      color: var(--text);
      font-family: "Inter", system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 2rem;
      line-height: 1.6;
    }
    h1 { margin-top: 0; font-size: 2rem; letter-spacing: 0.02em; }
    .panel {
      background: linear-gradient(145deg, #0b1222, #0c1426);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 12px 50px rgba(0, 0, 0, 0.35);
      margin-bottom: 1.5rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
    }
    .item {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 0.75rem 1rem;
    }
    .label { color: var(--muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .value { font-family: var(--mono); font-size: 1rem; }
    .bar {
      height: 6px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 999px;
      overflow: hidden;
      margin-top: 0.5rem;
    }
    .bar span { display: block; height: 100%; background: linear-gradient(90deg, #38bdf8, #a855f7); }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.5rem 0.25rem; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
    th { color: var(--muted); font-weight: 600; font-size: 0.9rem; }
    td { font-size: 0.95rem; }
    .mono { font-family: var(--mono); }
  </style>
</head>
<body>
  <h1>Astro Speed Measure</h1>
  <div class="panel">
    <div class="label">Total build time</div>
    <div class="value">${formatMs(report.totalBuildTime)}</div>
    <div class="bar"><span style="width:100%"></span></div>
  </div>

  ${renderSection("Integrations", report.integrations)}
  ${renderSection("Vite plugins", report.vitePlugins)}
  ${renderPages(report.pages)}
  ${renderAssets(report.assets)}
  ${renderContent(report.contentCollections)}
</body>
</html>`;
}

function renderSection(
  title: string,
  items: {
    name: string;
    duration: number;
    count: number;
    hooks?: { name: string; duration: number; count: number }[];
  }[],
): string {
  if (!items.length) return "";
  return `<div class="panel">
    <h2>${title}</h2>
    <table>
      <thead><tr><th>Name</th><th>Duration</th><th>Calls</th></tr></thead>
      <tbody>
        ${items
          .map(
            (item) => `<tr>
              <td>${escapeHtml(item.name)}</td>
              <td class="mono">${formatMs(item.duration)}</td>
              <td>${item.count}</td>
            </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  </div>`;
}

function renderPages(pages: TimingReport["pages"]): string {
  if (!pages.length) return "";
  return `<div class="panel">
    <h2>Pages</h2>
    <table>
      <thead><tr><th>Path</th><th>Type</th><th>Duration</th><th>Component</th></tr></thead>
      <tbody>
        ${pages
          .map(
            (page) => `<tr>
              <td>${escapeHtml(page.pathname)}</td>
              <td>${escapeHtml(page.type)}</td>
              <td class="mono">${formatMs(page.duration)}</td>
              <td class="mono">${escapeHtml(page.component)}</td>
            </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  </div>`;
}

function renderAssets(assets: TimingReport["assets"]): string {
  if (!assets.length) return "";
  return `<div class="panel">
    <h2>Assets</h2>
    <table>
      <thead><tr><th>Path</th><th>Type</th><th>Duration</th><th>Plugin</th></tr></thead>
      <tbody>
        ${assets
          .map(
            (asset) => `<tr>
              <td class="mono">${escapeHtml(asset.path)}</td>
              <td>${escapeHtml(asset.type)}</td>
              <td class="mono">${formatMs(asset.duration)}</td>
              <td>${escapeHtml(asset.plugin ?? "")}</td>
            </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  </div>`;
}

function renderContent(content: TimingReport["contentCollections"]): string {
  if (!content.length) return "";
  return `<div class="panel">
    <h2>Content collections</h2>
    <table>
      <thead><tr><th>Collection</th><th>Duration</th><th>Entries</th></tr></thead>
      <tbody>
        ${content
          .map(
            (collection) => `<tr>
              <td>${escapeHtml(collection.collection)}</td>
              <td class="mono">${formatMs(collection.duration)}</td>
              <td>${collection.entries}</td>
            </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  </div>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
