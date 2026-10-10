export const CATALOG_SEED_RECORD = Symbol('CatalogSeedRecord');

export interface CatalogSeedRecord {
  /** Records that the database was seeded at `at`; false when it already was, so the seed must write nothing. */
  markSeeded(at: Date): Promise<boolean>;
  /** When the database was seeded, or null if it never was. */
  seededAt(): Promise<Date | null>;
}
