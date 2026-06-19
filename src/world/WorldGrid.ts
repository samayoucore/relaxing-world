import { DEFAULT_BIOME_WEIGHTS, normalizeBiomeWeights } from '../biomes/BiomeWeights';
import type { BiomeWeights } from '../biomes/BiomeId';
import type { HexCoordinates } from '../hex/HexCoordinates';
import { clamp } from '../utils/MathUtils';
import type { CellSnapshot, WorldCellData } from './WorldCell';
import { cellCount, hexToIndex, indexToHex } from './WorldCoordinates';
import { DEFAULT_WORLD_CONFIG, SEA_LEVEL, type WorldConfig } from './WorldConfig';

export class WorldGrid {
  public readonly config: WorldConfig;
  private readonly landFlags: Uint8Array;
  private readonly elevations: Float32Array;
  private readonly biomeWeights: Float32Array;
  private readonly moisture: Float32Array;
  private readonly temperature: Float32Array;

  public constructor(config: WorldConfig = DEFAULT_WORLD_CONFIG) {
    this.config = { ...config };
    const count = cellCount(this.config);
    this.landFlags = new Uint8Array(count);
    this.elevations = new Float32Array(count);
    this.biomeWeights = new Float32Array(count * 4);
    this.moisture = new Float32Array(count);
    this.temperature = new Float32Array(count);
    this.reset();
  }

  public get count(): number {
    return this.landFlags.length;
  }

  public reset(): void {
    this.landFlags.fill(0);
    this.elevations.fill(SEA_LEVEL);
    this.moisture.fill(0.5);
    this.temperature.fill(0.5);

    for (let index = 0; index < this.count; index += 1) {
      this.setBiomeWeights(index, DEFAULT_BIOME_WEIGHTS);
    }
  }

  public hexToIndex(hex: HexCoordinates): number | undefined {
    return hexToIndex(hex, this.config);
  }

  public indexToHex(index: number): HexCoordinates {
    return indexToHex(index, this.config);
  }

  public hasHex(hex: HexCoordinates): boolean {
    return this.hexToIndex(hex) !== undefined;
  }

  public getCell(index: number): WorldCellData {
    this.assertIndex(index);

    return {
      isLand: this.landFlags[index] === 1,
      elevation: this.elevations[index] ?? SEA_LEVEL,
      biomeWeights: this.getBiomeWeights(index),
      moisture: this.moisture[index] ?? 0.5,
      temperature: this.temperature[index] ?? 0.5,
    };
  }

  public getCellByHex(hex: HexCoordinates): WorldCellData | undefined {
    const index = this.hexToIndex(hex);
    return index === undefined ? undefined : this.getCell(index);
  }

  public snapshot(index: number): CellSnapshot {
    return {
      index,
      ...this.getCell(index),
    };
  }

  public setCell(index: number, data: WorldCellData): void {
    this.assertIndex(index);
    this.landFlags[index] = data.isLand ? 1 : 0;
    this.elevations[index] = clamp(data.elevation, this.config.minElevation, this.config.maxElevation);
    this.setBiomeWeights(index, data.biomeWeights);
    this.moisture[index] = clamp(data.moisture, 0, 1);
    this.temperature[index] = clamp(data.temperature, 0, 1);
  }

  public mutateCell(index: number, mutate: (cell: WorldCellData) => WorldCellData): void {
    this.setCell(index, mutate(this.getCell(index)));
  }

  public getBiomeWeights(index: number): BiomeWeights {
    this.assertIndex(index);
    const offset = index * 4;

    return normalizeBiomeWeights([
      this.biomeWeights[offset] ?? 0,
      this.biomeWeights[offset + 1] ?? 0,
      this.biomeWeights[offset + 2] ?? 0,
      this.biomeWeights[offset + 3] ?? 0,
    ]);
  }

  public setBiomeWeights(index: number, weights: readonly number[]): void {
    this.assertIndex(index);
    const normalized = normalizeBiomeWeights(weights);
    const offset = index * 4;
    const [grass, forest, sand, snow] = normalized;
    this.biomeWeights[offset] = grass;
    this.biomeWeights[offset + 1] = forest;
    this.biomeWeights[offset + 2] = sand;
    this.biomeWeights[offset + 3] = snow;
  }

  public getRawCellsForSerialization(): {
    landFlags: number[];
    elevations: number[];
    biomeWeights: number[];
    moisture: number[];
    temperature: number[];
  } {
    return {
      landFlags: Array.from(this.landFlags),
      elevations: Array.from(this.elevations),
      biomeWeights: Array.from(this.biomeWeights),
      moisture: Array.from(this.moisture),
      temperature: Array.from(this.temperature),
    };
  }

  public loadRawCells(raw: {
    landFlags: readonly number[];
    elevations: readonly number[];
    biomeWeights: readonly number[];
    moisture: readonly number[];
    temperature: readonly number[];
  }): void {
    if (
      raw.landFlags.length !== this.count ||
      raw.elevations.length !== this.count ||
      raw.moisture.length !== this.count ||
      raw.temperature.length !== this.count ||
      raw.biomeWeights.length !== this.count * 4
    ) {
      throw new Error('Save data dimensions do not match world config.');
    }

    this.landFlags.set(raw.landFlags.map((value) => (value > 0 ? 1 : 0)));
    this.elevations.set(raw.elevations.map((value) => clamp(value, this.config.minElevation, this.config.maxElevation)));
    this.biomeWeights.set(raw.biomeWeights.map((value) => clamp(value, 0, 1)));
    this.moisture.set(raw.moisture.map((value) => clamp(value, 0, 1)));
    this.temperature.set(raw.temperature.map((value) => clamp(value, 0, 1)));
  }

  public forEachCell(callback: (index: number, hex: HexCoordinates, cell: WorldCellData) => void): void {
    for (let index = 0; index < this.count; index += 1) {
      callback(index, this.indexToHex(index), this.getCell(index));
    }
  }

  private assertIndex(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.count) {
      throw new RangeError(`Cell index ${index} is outside the world.`);
    }
  }
}
