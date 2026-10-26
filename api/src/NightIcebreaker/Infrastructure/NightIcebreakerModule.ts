import { Module } from '@nestjs/common';
import { CatalogModule } from '@Huemans/Catalog/Infrastructure/CatalogModule';
import { ColorDistributionModule } from '@Huemans/ColorDistribution/Infrastructure/ColorDistributionModule';
import { EventModule } from '@Huemans/Event/Infrastructure/EventModule';
import { ApplicationService } from '@Huemans/NightIcebreaker/Application/ApplicationService';
import { EVENT_DIRECTORY } from '@Huemans/NightIcebreaker/Domain/Port/EventDirectory';
import { GROUP_DIRECTORY } from '@Huemans/NightIcebreaker/Domain/Port/GroupDirectory';
import { ICEBREAKER_CATALOG } from '@Huemans/NightIcebreaker/Domain/Port/IcebreakerCatalog';
import { ICEBREAKER_EXPLAINER } from '@Huemans/NightIcebreaker/Domain/Port/IcebreakerExplainer';
import { NIGHT_ICEBREAKER_REPOSITORY } from '@Huemans/NightIcebreaker/Domain/Port/NightIcebreakerRepository';
import { ROOM_TRAITS_REPOSITORY } from '@Huemans/NightIcebreaker/Domain/Port/RoomTraitsRepository';
import { CatalogIcebreakerCatalog } from './Catalog/CatalogIcebreakerCatalog';
import { StaticIcebreakerExplainer } from './Catalog/StaticIcebreakerExplainer';
import { ColorDistributionGroupDirectory } from './ColorDistribution/ColorDistributionGroupDirectory';
import { EventContextDirectory } from './Event/EventContextDirectory';
import { CollectOnQuestionnaireCompleted } from './EventSubscriber/CollectOnQuestionnaireCompleted';
import { PickOnEventRevealed } from './EventSubscriber/PickOnEventRevealed';
import { NightIcebreakerController } from './Http/NightIcebreakerController';
import { MikroOrmNightIcebreakerRepository } from './Persistence/MikroOrm/MikroOrmNightIcebreakerRepository';
import { MikroOrmRoomTraitsRepository } from './Persistence/MikroOrm/MikroOrmRoomTraitsRepository';

@Module({
  imports: [CatalogModule, EventModule, ColorDistributionModule],
  controllers: [NightIcebreakerController],
  providers: [
    ApplicationService,
    { provide: ROOM_TRAITS_REPOSITORY, useClass: MikroOrmRoomTraitsRepository },
    { provide: NIGHT_ICEBREAKER_REPOSITORY, useClass: MikroOrmNightIcebreakerRepository },
    { provide: ICEBREAKER_CATALOG, useClass: CatalogIcebreakerCatalog },
    { provide: ICEBREAKER_EXPLAINER, useClass: StaticIcebreakerExplainer },
    { provide: EVENT_DIRECTORY, useClass: EventContextDirectory },
    { provide: GROUP_DIRECTORY, useClass: ColorDistributionGroupDirectory },
    CollectOnQuestionnaireCompleted,
    PickOnEventRevealed,
  ],
})
export class NightIcebreakerModule {}
