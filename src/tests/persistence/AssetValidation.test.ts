import { describe, expect, it } from 'vitest';
import { validateAssetManifest } from '../../assets/AssetValidation';

describe('AssetValidation', () => {
  it('accepts a well-formed manifest', () => {
    expect(
      validateAssetManifest({
        version: 1,
        assets: [
          {
            id: 'tree-oak',
            kind: 'model',
            path: '/assets/models/nature/tree-oak.glb',
            license: 'CC0',
            author: 'Example',
            sourceUrl: 'https://example.test/tree',
          },
        ],
      }),
    ).toBe(true);
  });

  it('rejects runtime remote asset paths', () => {
    expect(
      validateAssetManifest({
        version: 1,
        assets: [
          {
            id: 'bad',
            kind: 'model',
            path: 'https://example.test/bad.glb',
            license: 'Unknown',
            author: 'Unknown',
            sourceUrl: '',
          },
        ],
      }),
    ).toBe(false);
  });
});
