export interface AssetManifestEntry {
  id: string;
  kind: 'model' | 'texture' | 'environment' | 'audio';
  path: string;
  license: string;
  author: string;
  sourceUrl: string;
}

export interface AssetManifest {
  version: number;
  assets: readonly AssetManifestEntry[];
}
