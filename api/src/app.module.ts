import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ColorDistributionModule } from '@Huemans/ColorDistribution/Infrastructure/ColorDistributionModule';
import { mikroOrmConfig } from '@Huemans/Shared/Infrastructure/Persistence/MikroOrm/mikro-orm.config';
import { SharedModule } from '@Huemans/Shared/Infrastructure/SharedModule';
import { DatabaseHealthProbe } from './Health/DatabaseHealthProbe';
import { HealthController } from './Health/HealthController';

@Module({
  imports: [
    MikroOrmModule.forRoot({ ...mikroOrmConfig(), autoLoadEntities: true }),
    SharedModule,
    ColorDistributionModule,
  ],
  controllers: [HealthController],
  providers: [DatabaseHealthProbe],
})
export class AppModule {}
