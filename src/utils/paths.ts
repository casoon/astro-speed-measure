import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function normalizeId(id: string, root?: string): string {
  const withoutQuery = id.replace(/\0/g, '').split('?')[0];
  const asPath = withoutQuery.startsWith('file://')
    ? fileURLToPath(withoutQuery)
    : withoutQuery;
  const normalized = path.normalize(asPath);
  if (!root) return normalized;
  const normalizedRoot = path.normalize(root);
  if (normalized.startsWith(normalizedRoot)) {
    return normalized.slice(normalizedRoot.length + (normalizedRoot.endsWith(path.sep) ? 0 : 1));
  }
  return normalized;
}

export function relativePath(root: string, target: string): string {
  const normalizedRoot = path.normalize(root);
  const normalizedTarget = path.normalize(target);
  return path.relative(normalizedRoot, normalizedTarget);
}
