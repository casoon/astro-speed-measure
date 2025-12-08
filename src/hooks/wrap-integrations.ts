import type { AstroIntegration } from "astro";
import type { TimingStore } from "../utils/timing.js";
import { performance } from "node:perf_hooks";

/**
 * Wraps integration hooks in-place to preserve closure bindings.
 * This is critical for integrations like MDX that use closure variables
 * between hooks (e.g., astro:config:done modifying a shared variable).
 */
export function wrapIntegrationInPlace(
  integration: AstroIntegration,
  store: TimingStore,
): void {
  const hooks = integration.hooks;
  if (!hooks) return;

  for (const [hookName, hookFn] of Object.entries(hooks)) {
    if (typeof hookFn !== "function") continue;

    const isAsync = hookFn.constructor.name === "AsyncFunction";

    if (isAsync) {
      (hooks as any)[hookName] = async (...args: any[]) => {
        const start = performance.now();
        try {
          return await (hookFn as Function).apply(integration, args);
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
    } else {
      (hooks as any)[hookName] = (...args: any[]) => {
        const start = performance.now();
        try {
          return (hookFn as Function).apply(integration, args);
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
  }
}
