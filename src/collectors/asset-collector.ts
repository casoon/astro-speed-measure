import path from 'node:path';
import type { AssetTiming, AssetType, TimingSample } from '../types.js';
import { normalizeId } from '../utils/paths.js';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg']);
const STYLE_EXTENSIONS = new Set(['.css', '.scss', '.sass', '.less', '.pcss']);
const SCRIPT_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts', '.jsx', '.tsx']);
const FONT_EXTENSIONS = new Set(['.woff', '.woff2', '.ttf', '.otf', '.eot']);

export function collectAssets(samples: TimingSample[], root: string): AssetTiming[] {
  const assets = new Map<string, AssetTiming>();

  for (const sample of samples) {
    const id = typeof sample.meta?.id === 'string' ? normalizeId(sample.meta.id as string, root) : undefined;
    if (!id) continue;
    if (id.includes(`${path.sep}node_modules${path.sep}`)) continue;

    const ext = path.extname(id).toLowerCase();
    const type = resolveAssetType(ext);
    if (!type) continue;

    const key = `${type}:${id}`;
    const current = assets.get(key);
    if (current) {
      current.duration += sample.duration;
      continue;
    }

    assets.set(key, {
      path: id,
      duration: sample.duration,
      type,
      plugin: sample.name,
    });
  }

  return Array.from(assets.values()).sort((a, b) => b.duration - a.duration);
}

function resolveAssetType(ext: string): AssetType | null {
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';
  if (STYLE_EXTENSIONS.has(ext)) return 'style';
  if (SCRIPT_EXTENSIONS.has(ext)) return 'script';
  if (FONT_EXTENSIONS.has(ext)) return 'font';
  return ext ? 'other' : null;
}
