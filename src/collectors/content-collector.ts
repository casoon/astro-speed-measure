import path from 'node:path';
import type { ContentTiming, TimingSample } from '../types.js';
import { normalizeId } from '../utils/paths.js';

export function collectContent(samples: TimingSample[], root: string): ContentTiming[] {
  const collections = new Map<string, ContentTiming>();

  for (const sample of samples) {
    const id = typeof sample.meta?.id === 'string' ? normalizeId(sample.meta.id as string, root) : undefined;
    if (!id) continue;
    const segments = id.split(path.sep);
    const contentIndex = segments.indexOf('content');
    if (contentIndex === -1 || contentIndex === segments.length - 1) continue;

    const collection = segments[contentIndex + 1];
    const existing = collections.get(collection);
    const filePath = segments.slice(segments.indexOf('src')).join(path.sep);
    if (existing) {
      existing.duration += sample.duration;
      existing.entries += 1;
      if (!existing.files.includes(filePath)) existing.files.push(filePath);
    } else {
      collections.set(collection, {
        collection,
        duration: sample.duration,
        entries: 1,
        files: [filePath],
      });
    }
  }

  return Array.from(collections.values()).sort((a, b) => b.duration - a.duration);
}
