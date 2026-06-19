export interface WorldObject {
  id: string;
  definitionId: string;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  scale: number;
}

export interface ObjectDefinition {
  id: string;
  label: string;
  category: 'nature' | 'building' | 'rock';
}
