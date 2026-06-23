import pc from "picocolors";
import type { SpeedMeasureOptions, TimingReport } from "../types.js";
import { formatMs } from "../utils/format.js";

export function formatReport(
  report: TimingReport,
  options: SpeedMeasureOptions,
  logger: any,
): void {
  const { thresholds } = options;

  console.log("");
  console.log(
    pc.bold(
      pc.cyan(
        "╔══════════════════════════════════════════════════════════════╗",
      ),
    ),
  );
  console.log(
    pc.bold(
      pc.cyan(
        "║  ASTRO SPEED MEASURE - Build Performance Report              ║",
      ),
    ),
  );
  console.log(
    pc.bold(
      pc.cyan(
        "╠══════════════════════════════════════════════════════════════╣",
      ),
    ),
  );
  console.log(
    pc.bold(
      pc.cyan(
        `║  Total Build Time: ${formatMs(report.totalBuildTime).padEnd(42)}║`,
      ),
    ),
  );
  console.log(
    pc.bold(
      pc.cyan(
        "╚══════════════════════════════════════════════════════════════╝",
      ),
    ),
  );
  console.log("");

  if (report.integrations.length > 0) {
    console.log(pc.bold("INTEGRATIONS"));
    console.log(
      pc.gray(
        "────────────────────────────────────────────────────────────────",
      ),
    );

    for (const entry of report.integrations) {
      const timeStr = formatMs(entry.duration);
      const color = getColor(entry.duration, thresholds);
      const bar = createBar(entry.duration, report.totalBuildTime);
      const percent = ((entry.duration / report.totalBuildTime) * 100).toFixed(
        0,
      );

      console.log(
        `  ${color(entry.name.padEnd(24))} ${timeStr.padStart(8)}  ${bar}  ${percent}%`,
      );
      if (options.verbose && entry.hooks.length) {
        for (const hook of entry.hooks) {
          const hookTime = formatMs(hook.duration);
          console.log(
            `    ${pc.gray("└─")} ${hook.name.padEnd(22)} ${hookTime.padStart(
              8,
            )}`,
          );
        }
      }
    }
    console.log("");
  }

  if (report.vitePlugins.length > 0) {
    console.log(pc.bold("VITE PLUGINS"));
    console.log(
      pc.gray(
        "────────────────────────────────────────────────────────────────",
      ),
    );
    for (const entry of report.vitePlugins) {
      const timeStr = formatMs(entry.duration);
      const color = getColor(entry.duration, thresholds);
      const bar = createBar(entry.duration, report.totalBuildTime);
      const percent = ((entry.duration / report.totalBuildTime) * 100).toFixed(
        0,
      );
      console.log(
        `  ${color(entry.name.padEnd(24))} ${timeStr.padStart(
          8,
        )}  ${bar}  ${percent}%`,
      );
      if (options.verbose && entry.hooks.length) {
        for (const hook of entry.hooks) {
          const hookTime = formatMs(hook.duration);
          console.log(
            `    ${pc.gray("└─")} ${hook.name.padEnd(22)} ${hookTime.padStart(
              8,
            )}`,
          );
        }
      }
    }
    console.log("");
  }

  if (report.pages.length > 0 && options.measurePages !== false) {
    console.log(pc.bold("PAGES (slowest first)"));
    console.log(
      pc.gray(
        "────────────────────────────────────────────────────────────────",
      ),
    );
    for (const page of report.pages.slice(0, options.topPages ?? 10)) {
      const timeStr = formatMs(page.duration);
      const color = getColor(page.duration, thresholds);
      console.log(
        `  ${color(page.pathname.padEnd(32))} ${page.type.padEnd(
          4,
        )} ${timeStr.padStart(8)} ${pc.gray(page.component)}`,
      );
    }
    console.log("");
  }

  if (report.assets.length > 0 && options.measureAssets !== false) {
    console.log(pc.bold("ASSETS (slowest first)"));
    console.log(
      pc.gray(
        "────────────────────────────────────────────────────────────────",
      ),
    );
    for (const asset of report.assets.slice(0, options.topAssets ?? 10)) {
      const timeStr = formatMs(asset.duration);
      console.log(
        `  ${asset.type.padEnd(8)} ${timeStr.padStart(
          8,
        )} ${pc.gray(asset.path)}`,
      );
    }
    console.log("");
  }

  if (report.contentCollections.length > 0) {
    console.log(pc.bold("CONTENT COLLECTIONS"));
    console.log(
      pc.gray(
        "────────────────────────────────────────────────────────────────",
      ),
    );
    for (const collection of report.contentCollections) {
      const timeStr = formatMs(collection.duration);
      console.log(
        `  ${collection.collection.padEnd(16)} ${timeStr.padStart(
          8,
        )} (${collection.entries} entries)`,
      );
      if (options.verbose) {
        for (const file of collection.files) {
          console.log(`    ${pc.gray("└─")} ${file}`);
        }
      }
    }
    console.log("");
  }
}

function getColor(
  duration: number,
  thresholds?: { green?: number; yellow?: number },
) {
  const green = thresholds?.green ?? 100;
  const yellow = thresholds?.yellow ?? 1000;

  if (duration <= green) return pc.green;
  if (duration <= yellow) return pc.yellow;
  return pc.red;
}

function createBar(duration: number, total: number, width = 20): string {
  const percent = Math.max(0, Math.min(1, duration / Math.max(total, 1)));
  const filled = Math.max(0, Math.min(width, Math.round(percent * width)));
  const empty = Math.max(0, width - filled);
  return pc.cyan("█".repeat(filled) + "░".repeat(empty));
}
