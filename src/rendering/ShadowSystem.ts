export interface ShadowSettings {
  mapSize: number;
  bias: number;
  normalBias: number;
}

export const DEFAULT_SHADOW_SETTINGS: ShadowSettings = {
  mapSize: 2048,
  bias: 0.000_45,
  normalBias: 0.035,
};
