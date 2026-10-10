import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { mikroOrmConfig } from '@Huemans/Shared/Infrastructure/Persistence/MikroOrm/mikro-orm.config';
import { SharedModule } from '@Huemans/Shared/Infrastructure/SharedModule';
import { DatabaseHealthProbe } from './Health/DatabaseHealthProbe';
import { HealthController } from './Health/HealthController';

@Module({
  imports: [MikroOrmModule.forRoot({ ...mikroOrmConfig(), autoLoadEntities: true }), SharedModule],
  controllers: [HealthController],
  providers: [DatabaseHealthProbe],
})
export class AppModule {}
