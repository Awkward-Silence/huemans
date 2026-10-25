import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CatalogModule } from '@Huemans/Catalog/Infrastructure/CatalogModule';
import { ColorDistributionModule } from '@Huemans/ColorDistribution/Infrastructure/ColorDistributionModule';
import { EventModule } from '@Huemans/Event/Infrastructure/EventModule';
import { NightIcebreakerModule } from '@Huemans/NightIcebreaker/Infrastructure/NightIcebreakerModule';
import { ParticipationModule } from '@Huemans/Participation/Infrastructure/ParticipationModule';
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
    ParticipationModule,
    RoomModule,
    NightIcebreakerModule,
  ],
  controllers: [HealthController],
  providers: [DatabaseHealthProbe],
})
export class AppModule {}
