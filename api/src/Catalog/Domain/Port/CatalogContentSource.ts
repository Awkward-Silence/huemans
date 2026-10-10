import { AuthoredCatalog } from '../AuthoredCatalog';

export const CATALOG_CONTENT_SOURCE = Symbol('CatalogContentSource');

export interface CatalogContentSource {
  /** Authors the catalog from its content; throws naming the entry when any content rule is broken. */
  read(): AuthoredCatalog;
}
