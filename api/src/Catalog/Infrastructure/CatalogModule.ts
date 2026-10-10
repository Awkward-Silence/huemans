import { DynamicModule, Module } from '@nestjs/common';
import { ApplicationService } from '@Huemans/Catalog/Application/ApplicationService';
import { CATALOG_CONTENT_SOURCE } from '@Huemans/Catalog/Domain/Port/CatalogContentSource';
import { CATALOG_REPOSITORY } from '@Huemans/Catalog/Domain/Port/CatalogRepository';
import { CATALOG_SEED_RECORD } from '@Huemans/Catalog/Domain/Port/CatalogSeedRecord';
import { CatalogFilePaths, JsonCatalogContentSource } from './Content/JsonCatalogContentSource';
import { MikroOrmCatalogRepository } from './Persistence/MikroOrm/MikroOrmCatalogRepository';
import { MikroOrmCatalogSeedRecord } from './Persistence/MikroOrm/MikroOrmCatalogSeedRecord';

@Module({
  providers: [
    ApplicationService,
    { provide: CATALOG_REPOSITORY, useClass: MikroOrmCatalogRepository },
    { provide: CATALOG_SEED_RECORD, useClass: MikroOrmCatalogSeedRecord },
    { provide: CATALOG_CONTENT_SOURCE, useFactory: () => new JsonCatalogContentSource() },
  ],
  exports: [ApplicationService],
})
export class CatalogModule {
  /** The catalog seeded from other content files than the default ones (the seed command's arguments). */
  static withContentFiles(paths: CatalogFilePaths): DynamicModule {
    return {
      module: CatalogModule,
      providers: [{ provide: CATALOG_CONTENT_SOURCE, useValue: new JsonCatalogContentSource(paths) }],
    };
  }
}
