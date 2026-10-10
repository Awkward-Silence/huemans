import { Module } from '@nestjs/common';
import { ApplicationService } from '@Huemans/Catalog/Application/ApplicationService';
import { CATALOG_REPOSITORY } from '@Huemans/Catalog/Domain/Port/CatalogRepository';
import { MikroOrmCatalogRepository } from './Persistence/MikroOrm/MikroOrmCatalogRepository';
import { MikroOrmCatalogSeeder } from './Seed/MikroOrmCatalogSeeder';

@Module({
  providers: [
    ApplicationService,
    { provide: CATALOG_REPOSITORY, useClass: MikroOrmCatalogRepository },
    MikroOrmCatalogSeeder,
  ],
  exports: [ApplicationService, MikroOrmCatalogSeeder],
})
export class CatalogModule {}
