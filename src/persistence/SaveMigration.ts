import { SAVE_SCHEMA_VERSION, type SaveFile } from './SaveSchema';

export const migrateSave = (save: SaveFile): SaveFile => {
  if (save.schemaVersion !== SAVE_SCHEMA_VERSION) {
    throw new Error(`Unsupported save schema version ${save.schemaVersion}.`);
  }

  return save;
};
