import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CatalogModule } from '@Huemans/Catalog/Infrastructure/CatalogModule';
import { ColorDistributionModule } from '@Huemans/ColorDistribution/Infrastructure/ColorDistributionModule';
import { EventModule } from '@Huemans/Event/Infrastructure/EventModule';
import { RoomModule } from '@Huemans/Room/Infrastructure/RoomModule';
import { mikroOrmConfig } from '@Huemans/Shared/Infrastructure/Persistence/MikroOrm/mikro-orm.config';
import { SharedModule } from '@Huemans/Shared/Infrastructure/SharedModule';
import { DatabaseHealthProbe } from './Health/DatabaseHealthProbe';
import { HealthController } from './Health/HealthController';

@Module({
  imports: [
    MikroOrmModule.forRoot({ ...mikroOrmConfig(), autoLoadEntities: true }),
    SharedModule,
    CatalogModule,
    EventModule,
    ColorDistributionModule,
    RoomModule,
  ],
  controllers: [HealthController],
  providers: [DatabaseHealthProbe],
})
export class AppModule {}
