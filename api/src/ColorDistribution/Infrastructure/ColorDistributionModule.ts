import { Module } from '@nestjs/common';
import { CatalogModule } from '@Huemans/Catalog/Infrastructure/CatalogModule';
import { ApplicationService } from '@Huemans/ColorDistribution/Application/ApplicationService';
import { COLOR_EXPLAINER } from '@Huemans/ColorDistribution/Domain/Port/ColorExplainer';
import { EVENT_DISTRIBUTION_REPOSITORY } from '@Huemans/ColorDistribution/Domain/Port/EventDistributionRepository';
import { TRAIT_TYPE_MAPPING_PROVIDER } from '@Huemans/ColorDistribution/Domain/Port/TraitTypeMappingProvider';
import { CatalogTraitTypeMappingProvider } from './Catalog/CatalogTraitTypeMappingProvider';
import { StaticColorExplainer } from './Catalog/StaticColorExplainer';
import { AssignOnQuestionnaireCompleted } from './EventSubscriber/AssignOnQuestionnaireCompleted';
import { OpenDistributionOnEventCreated } from './EventSubscriber/OpenDistributionOnEventCreated';
import { ColorDistributionController } from './Http/ColorDistributionController';
import { MikroOrmEventDistributionRepository } from './Persistence/MikroOrm/MikroOrmEventDistributionRepository';

@Module({
  imports: [CatalogModule],
  controllers: [ColorDistributionController],
  providers: [
    ApplicationService,
    { provide: EVENT_DISTRIBUTION_REPOSITORY, useClass: MikroOrmEventDistributionRepository },
    { provide: TRAIT_TYPE_MAPPING_PROVIDER, useClass: CatalogTraitTypeMappingProvider },
    { provide: COLOR_EXPLAINER, useClass: StaticColorExplainer },
    OpenDistributionOnEventCreated,
    AssignOnQuestionnaireCompleted,
  ],
})
export class ColorDistributionModule {}
