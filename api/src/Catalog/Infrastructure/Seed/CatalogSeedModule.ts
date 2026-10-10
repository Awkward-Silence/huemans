import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { mikroOrmConfig } from '@Huemans/Shared/Infrastructure/Persistence/MikroOrm/mikro-orm.config';
import { CatalogModule } from '../CatalogModule';

// Only what the seed command needs: no controllers or event subscribers from the rest of the app.
@Module({
  imports: [MikroOrmModule.forRoot(mikroOrmConfig()), CatalogModule],
})
export class CatalogSeedModule {}
