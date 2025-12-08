import fs from "node:fs/promises";
import type { TimingReport } from "../types.js";

export async function writeJsonReport(
  report: TimingReport,
  outputFile = "./astro-speed-measure-report.json",
  logger?: any,
): Promise<void> {
  const payload = JSON.stringify(report, null, 2);
  if (outputFile) {
    await fs.writeFile(outputFile, payload, "utf8");
    logger?.info?.(`astro-speed-measure: wrote JSON report to ${outputFile}`);
  } else {
    console.log(payload);
  }
}
