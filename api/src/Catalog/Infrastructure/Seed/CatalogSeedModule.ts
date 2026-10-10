import { DynamicModule, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { mikroOrmConfig } from '@Huemans/Shared/Infrastructure/Persistence/MikroOrm/mikro-orm.config';
import { SharedModule } from '@Huemans/Shared/Infrastructure/SharedModule';
import { CatalogFilePaths } from '../Content/JsonCatalogContentSource';
import { CatalogModule } from '../CatalogModule';

// Only what the seed command needs: no controllers or event subscribers from the rest of the app.
@Module({})
export class CatalogSeedModule {
  static forFiles(paths: CatalogFilePaths): DynamicModule {
    return {
      module: CatalogSeedModule,
      imports: [MikroOrmModule.forRoot(mikroOrmConfig()), SharedModule, CatalogModule.withContentFiles(paths)],
    };
  }
}
