import type { ObjectDefinition } from './WorldObject';

const TREE_DEFINITION: ObjectDefinition = { id: 'tree', label: 'Tree', category: 'nature' };

export const OBJECT_DEFINITIONS: readonly ObjectDefinition[] = Object.freeze([
  TREE_DEFINITION,
  { id: 'rock', label: 'Rock', category: 'rock' },
  { id: 'house', label: 'House', category: 'building' },
]);

export const getObjectDefinition = (id: string): ObjectDefinition =>
  OBJECT_DEFINITIONS.find((definition) => definition.id === id) ?? TREE_DEFINITION;
