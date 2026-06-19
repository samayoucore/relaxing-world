import { SeededRandom } from '../utils/Random';
import type { WorldObject } from './WorldObject';

export type ObjectHeightSampler = (x: number, z: number) => number;

export interface ObjectChange {
  added: readonly WorldObject[];
  removed: readonly WorldObject[];
}

export class ObjectPlacementSystem {
  private readonly objects = new Map<string, WorldObject>();
  private nextId = 1;

  public list(): WorldObject[] {
    return Array.from(this.objects.values());
  }

  public count(): number {
    return this.objects.size;
  }

  public add(object: Omit<WorldObject, 'id'>): WorldObject {
    const created: WorldObject = {
      id: `object-${this.nextId}`,
      ...object,
    };
    this.nextId += 1;
    this.objects.set(created.id, created);
    return created;
  }

  public addExisting(object: WorldObject): void {
    this.objects.set(object.id, object);
    const suffix = Number(object.id.split('-').at(-1));

    if (Number.isFinite(suffix)) {
      this.nextId = Math.max(this.nextId, suffix + 1);
    }
  }

  public removeNearest(x: number, z: number, radius: number): WorldObject | undefined {
    let nearest: WorldObject | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const object of this.objects.values()) {
      const distance = Math.hypot(object.x - x, object.z - z);

      if (distance < radius && distance < nearestDistance) {
        nearest = object;
        nearestDistance = distance;
      }
    }

    if (nearest) {
      this.objects.delete(nearest.id);
    }

    return nearest;
  }

  public remove(id: string): WorldObject | undefined {
    const object = this.objects.get(id);

    if (object) {
      this.objects.delete(id);
    }

    return object;
  }

  public clear(): void {
    this.objects.clear();
    this.nextId = 1;
  }

  public scatter(
    definitionId: string,
    center: { x: number; y: number; z: number },
    radius: number,
    density: number,
    seed: number,
    heightAt?: ObjectHeightSampler,
  ): WorldObject[] {
    const created: WorldObject[] = [];
    const random = new SeededRandom(seed);
    const count = Math.max(1, Math.round(density));

    for (let index = 0; index < count; index += 1) {
      const angle = random.range(0, Math.PI * 2);
      const distance = Math.sqrt(random.next()) * radius;
      const x = center.x + Math.cos(angle) * distance;
      const z = center.z + Math.sin(angle) * distance;
      created.push(
        this.add({
          definitionId,
          x,
          y: heightAt ? heightAt(x, z) : center.y,
          z,
          rotationY: random.range(0, Math.PI * 2),
          scale: random.range(0.85, 1.2),
        }),
      );
    }

    return created;
  }
}
