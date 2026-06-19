import { BIOMES } from '../biomes/BiomeRegistry';
import { DEFAULT_BRUSH_SETTINGS, type BrushMode, type BrushSettings, type BrushTool } from '../brushes/Brush';
import { OBJECT_DEFINITIONS } from '../objects/ObjectRegistry';

export interface UiDiagnostics {
  text: string;
}

export interface AppUiEvents {
  onToolChange(tool: BrushTool): void;
  onBrushChange(settings: BrushSettings): void;
  onNewWorld(): void;
  onSave(): void;
  onLoad(): void;
  onExport(): void;
  onImport(file: File): void;
  onUndo(): void;
  onRedo(): void;
  onSettings(): void;
}

export class AppUi {
  private readonly canvas: HTMLCanvasElement;
  private readonly loading: HTMLElement;
  private readonly diagnostics: HTMLElement;
  private readonly toast: HTMLElement;
  private readonly importInput: HTMLInputElement;
  private settings: BrushSettings = { ...DEFAULT_BRUSH_SETTINGS };

  public constructor(
    root: HTMLElement,
    private readonly events: AppUiEvents,
  ) {
    root.innerHTML = '';
    root.className = 'app-root';

    const shell = this.element('div', 'game-shell');
    this.canvas = this.element('canvas', 'game-canvas') as HTMLCanvasElement;
    this.canvas.setAttribute('aria-label', 'Relaxing World 3D canvas');
    shell.append(this.canvas);
    shell.append(this.createTopbar());
    shell.append(this.createToolbar());
    shell.append(this.createBrushPanel());
    this.diagnostics = this.element('div', 'debug-strip');
    this.diagnostics.dataset.ui = 'true';
    shell.append(this.diagnostics);
    this.toast = this.element('div', 'toast');
    this.toast.dataset.ui = 'true';
    shell.append(this.toast);
    this.loading = this.element('div', 'loading-screen');
    this.loading.textContent = 'Loading world';
    shell.append(this.loading);
    root.append(shell);

    this.importInput = this.element('input') as HTMLInputElement;
    this.importInput.type = 'file';
    this.importInput.accept = 'application/json';
    this.importInput.hidden = true;
    this.importInput.addEventListener('change', () => {
      const file = this.importInput.files?.[0];

      if (file) {
        this.events.onImport(file);
      }

      this.importInput.value = '';
    });
    root.append(this.importInput);
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public setLoading(visible: boolean): void {
    this.loading.classList.toggle('is-hidden', !visible);
  }

  public showToast(message: string): void {
    this.toast.textContent = message;
    this.toast.classList.add('is-visible');
    window.setTimeout(() => {
      this.toast.classList.remove('is-visible');
    }, 2_200);
  }

  public setDiagnostics(text: string): void {
    this.diagnostics.textContent = text;
  }

  public openImportPicker(): void {
    this.importInput.click();
  }

  private createTopbar(): HTMLElement {
    const topbar = this.element('div', 'topbar');
    topbar.dataset.ui = 'true';
    topbar.append(
      this.button('New World', () => this.events.onNewWorld()),
      this.button('Save', () => this.events.onSave()),
      this.button('Load', () => this.events.onLoad()),
      this.button('Export', () => this.events.onExport()),
      this.button('Import', () => this.openImportPicker()),
      this.button('Undo', () => this.events.onUndo(), 'undo-button'),
      this.button('Redo', () => this.events.onRedo(), 'redo-button'),
      this.button('Settings', () => this.events.onSettings()),
    );
    return topbar;
  }

  private createToolbar(): HTMLElement {
    const toolbar = this.element('div', 'toolbox');
    toolbar.dataset.ui = 'true';
    const tools: readonly { id: BrushTool; label: string }[] = [
      { id: 'land', label: 'Land' },
      { id: 'height', label: 'Height' },
      { id: 'smooth', label: 'Smooth' },
      { id: 'biome', label: 'Biomes' },
      { id: 'object', label: 'Objects' },
      { id: 'erase', label: 'Erase' },
    ];

    for (const tool of tools) {
      const button = this.button(tool.label, () => {
        this.settings = { ...this.settings, tool: tool.id };
        this.events.onToolChange(tool.id);
        this.events.onBrushChange(this.settings);
        this.updateActiveTools(toolbar);
      });
      button.dataset.tool = tool.id;
      toolbar.append(button);
    }

    this.updateActiveTools(toolbar);
    return toolbar;
  }

  private createBrushPanel(): HTMLElement {
    const panel = this.element('div', 'brush-panel');
    panel.dataset.ui = 'true';

    const radius = this.range('Radius', 1, 8, this.settings.radius, 1, (value) => {
      this.settings = { ...this.settings, radius: value };
      this.events.onBrushChange(this.settings);
    });
    const strength = this.range('Strength', 0.05, 1, this.settings.strength, 0.05, (value) => {
      this.settings = { ...this.settings, strength: value };
      this.events.onBrushChange(this.settings);
    });
    const scatter = this.range('Scatter', 1, 12, this.settings.scatterDensity, 1, (value) => {
      this.settings = { ...this.settings, scatterDensity: value };
      this.events.onBrushChange(this.settings);
    });

    const mode = this.element('select', 'select') as HTMLSelectElement;
    for (const item of ['add', 'remove'] satisfies BrushMode[]) {
      const option = this.element('option') as HTMLOptionElement;
      option.value = item;
      option.textContent = item === 'add' ? 'Add' : 'Remove';
      mode.append(option);
    }
    mode.addEventListener('change', () => {
      this.settings = { ...this.settings, mode: mode.value as BrushMode };
      this.events.onBrushChange(this.settings);
    });

    const biomeGroup = this.element('div', 'swatch-row');
    for (const biome of BIOMES) {
      const button = this.element('button', 'swatch-button') as HTMLButtonElement;
      button.title = biome.label;
      button.style.background = biome.uiColor;
      button.addEventListener('click', () => {
        this.settings = { ...this.settings, biomeId: biome.id };
        this.events.onBrushChange(this.settings);
      });
      biomeGroup.append(button);
    }

    const objectGroup = this.element('div', 'object-row');
    for (const definition of OBJECT_DEFINITIONS) {
      const button = this.button(definition.label, () => {
        this.settings = { ...this.settings, objectDefinitionId: definition.id };
        this.events.onBrushChange(this.settings);
      });
      objectGroup.append(button);
    }

    panel.append(
      radius,
      strength,
      scatter,
      this.labeled('Mode', mode),
      this.labeled('Biome', biomeGroup),
      this.labeled('Object', objectGroup),
    );

    return panel;
  }

  private range(
    label: string,
    min: number,
    max: number,
    value: number,
    step: number,
    onInput: (value: number) => void,
  ): HTMLElement {
    const input = this.element('input') as HTMLInputElement;
    input.type = 'range';
    input.min = String(min);
    input.max = String(max);
    input.value = String(value);
    input.step = String(step);
    input.addEventListener('input', () => onInput(Number(input.value)));
    return this.labeled(label, input);
  }

  private labeled(label: string, control: HTMLElement): HTMLElement {
    const wrapper = this.element('label', 'control');
    const span = this.element('span');
    span.textContent = label;
    wrapper.append(span, control);
    return wrapper;
  }

  private button(label: string, onClick: () => void, id?: string): HTMLButtonElement {
    const button = this.element('button', 'ui-button') as HTMLButtonElement;
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', onClick);

    if (id) {
      button.id = id;
    }

    return button;
  }

  private element(tag: string, className?: string): HTMLElement {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    return element;
  }

  private updateActiveTools(toolbar: HTMLElement): void {
    for (const button of toolbar.querySelectorAll<HTMLButtonElement>('[data-tool]')) {
      button.classList.toggle('is-active', button.dataset.tool === this.settings.tool);
    }
  }
}
