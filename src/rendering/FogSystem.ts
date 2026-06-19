export interface FogSettings {
  density: number;
  color: readonly [number, number, number];
}

export const DEFAULT_FOG_SETTINGS: FogSettings = {
  density: 0.006,
  color: [0.66, 0.77, 0.81],
};
