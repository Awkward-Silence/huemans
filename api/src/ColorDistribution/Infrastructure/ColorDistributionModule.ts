import { Module } from '@nestjs/common';
import { ApplicationService } from '@Huemans/ColorDistribution/Application/ApplicationService';
import { COLOR_EXPLAINER } from '@Huemans/ColorDistribution/Domain/Port/ColorExplainer';
import { EVENT_DISTRIBUTION_REPOSITORY } from '@Huemans/ColorDistribution/Domain/Port/EventDistributionRepository';
import { TRAIT_TYPE_MAPPING_PROVIDER } from '@Huemans/ColorDistribution/Domain/Port/TraitTypeMappingProvider';
import { ProvisionalTraitTypeMappingProvider } from './Catalog/ProvisionalTraitTypeMappingProvider';
import { StaticColorExplainer } from './Catalog/StaticColorExplainer';
import { AssignOnQuestionnaireCompleted } from './EventSubscriber/AssignOnQuestionnaireCompleted';
import { OpenDistributionOnEventCreated } from './EventSubscriber/OpenDistributionOnEventCreated';
import { ColorDistributionController } from './Http/ColorDistributionController';
import { MikroOrmEventDistributionRepository } from './Persistence/MikroOrm/MikroOrmEventDistributionRepository';

@Module({
  controllers: [ColorDistributionController],
  providers: [
    ApplicationService,
    { provide: EVENT_DISTRIBUTION_REPOSITORY, useClass: MikroOrmEventDistributionRepository },
    { provide: TRAIT_TYPE_MAPPING_PROVIDER, useClass: ProvisionalTraitTypeMappingProvider },
    { provide: COLOR_EXPLAINER, useClass: StaticColorExplainer },
    OpenDistributionOnEventCreated,
    AssignOnQuestionnaireCompleted,
  ],
  exports: [ApplicationService],
})
export class ColorDistributionModule {}
