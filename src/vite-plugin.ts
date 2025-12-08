import { performance } from "node:perf_hooks";
import type { Plugin } from "vite";
import type { TimingStore } from "./utils/timing.js";

const HOOKS_TO_TIME: (keyof Plugin)[] = [
  "resolveId",
  "load",
  "transform",
  "renderChunk",
];

export function createTimingVitePlugin(store: TimingStore): Plugin {
  return {
    name: "astro-speed-measure:vite",
    enforce: "pre",
    configResolved(config) {
      for (const plugin of config.plugins ?? []) {
        if (!plugin || plugin.name === "astro-speed-measure:vite") continue;
        for (const hookName of HOOKS_TO_TIME) {
          wrapHook(plugin, hookName, store);
        }
      }
    },
  };
}

function wrapHook(plugin: Plugin, hookName: keyof Plugin, store: TimingStore) {
  const original = plugin[hookName];
  if (!original) return;

  if (Array.isArray(original)) {
    plugin[hookName] = original.map((fn) =>
      wrapFunction(fn, plugin, hookName, store),
    ) as any;
    return;
  }

  if (typeof original === "function") {
    plugin[hookName] = wrapFunction(original, plugin, hookName, store) as any;
  }
}

function wrapFunction(
  fn: Function,
  plugin: Plugin,
  hookName: keyof Plugin,
  store: TimingStore,
): Function {
  const isAsync = fn.constructor.name === "AsyncFunction";

  if (isAsync) {
    return async function wrapped(this: any, ...args: any[]) {
      const start = performance.now();
      try {
        return await fn.apply(this, args);
      } finally {
        const duration = performance.now() - start;
        store.record({
          category: "vite-plugin",
          name: plugin.name || "anonymous-plugin",
          duration,
          hook: String(hookName),
          detail: extractId(hookName, args),
          meta: {
            id: extractId(hookName, args),
            hook: hookName,
          },
        });
      }
    };
  } else {
    return function wrapped(this: any, ...args: any[]) {
      const start = performance.now();
      try {
        return fn.apply(this, args);
      } finally {
        const duration = performance.now() - start;
        store.record({
          category: "vite-plugin",
          name: plugin.name || "anonymous-plugin",
          duration,
          hook: String(hookName),
          detail: extractId(hookName, args),
          meta: {
            id: extractId(hookName, args),
            hook: hookName,
          },
        });
      }
    };
  }
}

function extractId(hookName: keyof Plugin, args: any[]): string | undefined {
  switch (hookName) {
    case "transform":
      return args[1];
    case "resolveId":
    case "load":
      return args[0];
    case "renderChunk":
      return args[1]?.facadeModuleId ?? args[1]?.fileName;
    default:
      return undefined;
  }
}
