import type { AstroIntegration } from 'astro';
import type { TimingData, TimingEntry } from '../types.js';

export function wrapIntegration(
  integration: AstroIntegration,
  timings: TimingData
): AstroIntegration {
  const wrappedHooks: AstroIntegration['hooks'] = {};

  for (const [hookName, hookFn] of Object.entries(integration.hooks || {})) {
    (wrappedHooks as any)[hookName] = async (...args: any[]) => {
      const start = performance.now();
      try {
        return await (hookFn as Function)(...args);
      } finally {
        const duration = performance.now() - start;
        recordTiming(timings, integration.name, hookName, duration);
      }
    };
  }

  return {
    ...integration,
    hooks: wrappedHooks,
  };
}

function recordTiming(
  timings: TimingData,
  integrationName: string,
  hookName: string,
  duration: number
): void {
  const entries = timings.entries.get(integrationName) || [];
  entries.push({
    name: integrationName,
    hook: hookName,
    duration,
  });
  timings.entries.set(integrationName, entries);
}
