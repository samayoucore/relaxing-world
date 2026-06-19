import '../ui/ui.css';
import { AppUi } from '../ui/AppUi';
import { Game } from './Game';

const root = document.querySelector<HTMLElement>('#app');

if (!root) {
  throw new Error('Missing #app root element.');
}

const gameRef: { current?: Game } = {};

const ui = new AppUi(root, {
  onToolChange: () => undefined,
  onBrushChange: (settings) => gameRef.current?.setBrush(settings),
  onNewWorld: () => {
    gameRef.current?.newWorld();
  },
  onSave: () => {
    void gameRef.current?.save();
  },
  onLoad: () => {
    void gameRef.current?.load();
  },
  onExport: () => gameRef.current?.exportJson(),
  onImport: (file) => {
    void gameRef.current?.importJson(file);
  },
  onUndo: () => gameRef.current?.undo(),
  onRedo: () => gameRef.current?.redo(),
  onSettings: () => ui.showToast('Quality preset: medium'),
});

gameRef.current = new Game(ui);

try {
  gameRef.current.start();
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown startup error';
  ui.showToast(message);
  ui.setLoading(false);
  throw error;
}
