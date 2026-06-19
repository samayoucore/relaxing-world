import { blendBiomeWeight } from '../biomes/BiomeWeights';
import type { HexCoordinates } from '../hex/HexCoordinates';
import { hexDistance } from '../hex/HexMath';
import { hexesInRadius } from '../hex/HexRange';
import { clamp, smoothstep } from '../utils/MathUtils';
import type { CellSnapshot, WorldCellData } from '../world/WorldCell';
import type { WorldGrid } from '../world/WorldGrid';
import type { BrushSettings } from './Brush';

export interface CellChange {
  index: number;
  before: CellSnapshot;
  after: CellSnapshot;
}

export class BrushManager {
  public applyCellBrush(world: WorldGrid, center: HexCoordinates, settings: BrushSettings): CellChange[] {
    const changes: CellChange[] = [];
    const changedIndices = new Set<number>();

    for (const hex of hexesInRadius(center, settings.radius)) {
      const index = world.hexToIndex(hex);

      if (index === undefined || changedIndices.has(index)) {
        continue;
      }

      const before = world.snapshot(index);
      const distance = hexDistance(center, hex);
      const falloff = this.getFalloff(distance, settings.radius, settings.falloff);
      const afterCell = this.applyToCell(world, index, before, falloff, settings);
      world.setCell(index, afterCell);
      const after = world.snapshot(index);

      if (!this.sameCell(before, after)) {
        changes.push({ index, before, after });
        changedIndices.add(index);
      }
    }

    return changes;
  }

  public getFalloff(distance: number, radius: number, mode: BrushSettings['falloff']): number {
    const normalized = radius <= 0 ? 1 : clamp(1 - distance / (radius + 0.001), 0, 1);
    return mode === 'smooth' ? smoothstep(0, 1, normalized) : normalized;
  }

  private applyToCell(
    world: WorldGrid,
    index: number,
    cell: WorldCellData,
    falloff: number,
    settings: BrushSettings,
  ): WorldCellData {
    const strength = clamp(settings.strength * falloff, 0, 1);

    switch (settings.tool) {
      case 'land':
        return {
          ...cell,
          isLand: settings.mode === 'remove' ? false : true,
          elevation:
            settings.mode === 'remove'
              ? 0
              : Math.max(cell.elevation, 0.62 + 0.32 * strength),
        };
      case 'height': {
        const direction = settings.mode === 'remove' ? -1 : 1;
        return {
          ...cell,
          isLand: true,
          elevation: clamp(
            cell.elevation + direction * strength * 0.35,
            world.config.minElevation,
            world.config.maxElevation,
          ),
        };
      }
      case 'smooth': {
        const average = this.averageNeighborElevation(world, index);
        return {
          ...cell,
          isLand: cell.isLand || average > 0.05,
          elevation: cell.elevation + (average - cell.elevation) * strength,
        };
      }
      case 'biome':
        return {
          ...cell,
          isLand: true,
          elevation: Math.max(cell.elevation, 0.2),
          biomeWeights: blendBiomeWeight(cell.biomeWeights, settings.biomeId, strength),
        };
      case 'erase':
        return {
          ...cell,
          isLand: false,
          elevation: 0,
        };
      case 'object':
        return cell;
    }
  }

  private averageNeighborElevation(world: WorldGrid, index: number): number {
    const center = world.indexToHex(index);
    const cells = hexesInRadius(center, 1);
    let total = 0;
    let count = 0;

    for (const hex of cells) {
      const neighborIndex = world.hexToIndex(hex);

      if (neighborIndex === undefined) {
        continue;
      }

      const neighbor = world.getCell(neighborIndex);

      if (neighbor.isLand) {
        total += neighbor.elevation;
        count += 1;
      }
    }

    return count === 0 ? 0 : total / count;
  }

  private sameCell(left: CellSnapshot, right: CellSnapshot): boolean {
    return (
      left.isLand === right.isLand &&
      Math.abs(left.elevation - right.elevation) < 0.000_01 &&
      Math.abs(left.moisture - right.moisture) < 0.000_01 &&
      Math.abs(left.temperature - right.temperature) < 0.000_01 &&
      left.biomeWeights.every((value, index) => Math.abs(value - (right.biomeWeights[index] ?? 0)) < 0.000_01)
    );
  }
}
