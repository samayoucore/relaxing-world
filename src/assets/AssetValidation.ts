import type { AssetManifest } from './AssetManifest';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const validateAssetManifest = (value: unknown): value is AssetManifest => {
  if (!isRecord(value) || typeof value.version !== 'number' || !Array.isArray(value.assets)) {
    return false;
  }

  return value.assets.every(
    (asset) =>
      isRecord(asset) &&
      typeof asset.id === 'string' &&
      ['model', 'texture', 'environment', 'audio'].includes(String(asset.kind)) &&
      typeof asset.path === 'string' &&
      asset.path.startsWith('/assets/') &&
      typeof asset.license === 'string' &&
      typeof asset.author === 'string' &&
      typeof asset.sourceUrl === 'string',
  );
};
