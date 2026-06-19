import type { SaveFile } from './SaveSchema';
import { WorldDeserializer } from './WorldDeserializer';

export class JsonExportService {
  public static stringify(save: SaveFile): string {
    return JSON.stringify(save, null, 2);
  }

  public static parse(text: string): SaveFile {
    return WorldDeserializer.parseJson(text);
  }

  public static download(save: SaveFile): void {
    const blob = new Blob([JsonExportService.stringify(save)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${save.worldName.toLowerCase().replaceAll(/\s+/g, '-')}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
