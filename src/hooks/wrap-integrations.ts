import type { AstroIntegration } from "astro";
import type { TimingStore } from "../utils/timing.js";
import { performance } from "node:perf_hooks";

export function wrapIntegration(
  integration: AstroIntegration,
  store: TimingStore,
): AstroIntegration {
  const wrappedHooks: AstroIntegration["hooks"] = {};

  for (const [hookName, hookFn] of Object.entries(integration.hooks || {})) {
    (wrappedHooks as any)[hookName] = async (...args: any[]) => {
      const start = performance.now();
      try {
        return await (hookFn as Function)(...args);
      } finally {
        store.record({
          category: "integration",
          name: integration.name,
          duration: performance.now() - start,
          hook: hookName,
          meta: { hook: hookName },
        });
      }
    };
  }

  return {
    ...integration,
    hooks: wrappedHooks,
  };
}
