import { DEFAULT_BRUSH_SETTINGS, type BrushSettings } from '../brushes/Brush';

export interface GameState {
  brush: BrushSettings;
  worldName: string;
}

export const createInitialGameState = (): GameState => ({
  brush: { ...DEFAULT_BRUSH_SETTINGS },
  worldName: 'Quiet Ocean',
});
