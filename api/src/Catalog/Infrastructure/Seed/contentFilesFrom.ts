import { resolve } from 'node:path';
import { CatalogFilePaths, DEFAULT_CATALOG_FILES } from '../Content/JsonCatalogContentSource';

/** The content files named on the command line, in order, falling back to the default file for each one left out. */
export function contentFilesFrom(argv: string[]): CatalogFilePaths {
  const [questions, icebreakers, profiles, mapping] = argv.slice(2);
  return {
    questions: resolve(questions ?? DEFAULT_CATALOG_FILES.questions),
    icebreakers: resolve(icebreakers ?? DEFAULT_CATALOG_FILES.icebreakers),
    profiles: resolve(profiles ?? DEFAULT_CATALOG_FILES.profiles),
    mapping: resolve(mapping ?? DEFAULT_CATALOG_FILES.mapping),
  };
}
