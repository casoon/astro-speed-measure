import type { AstroIntegration } from "astro";
import { createSpeedMeasureIntegration } from "./integration.js";
import type {
  SpeedMeasureOptions,
  TimingReport,
  TimingSample,
} from "./types.js";

export function speedMeasure(
  userOptions: SpeedMeasureOptions = {},
): AstroIntegration {
  return createSpeedMeasureIntegration(userOptions);
}

export default speedMeasure;
export type {
  SpeedMeasureOptions,
  TimingReport,
  TimingSample,
} from "./types.js";
