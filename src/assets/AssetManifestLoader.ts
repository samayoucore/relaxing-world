import type { AssetManifest } from './AssetManifest';
import { validateAssetManifest } from './AssetValidation';

export class AssetManifestLoader {
  public async load(path = '/assets/manifest.json'): Promise<AssetManifest> {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`Failed to load asset manifest: ${response.status}`);
    }

    const json = (await response.json()) as unknown;

    if (!validateAssetManifest(json)) {
      throw new Error('Asset manifest has an invalid format.');
    }

    return json;
  }
}
