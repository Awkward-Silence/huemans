import { Module } from '@nestjs/common';
import { CatalogModule } from '@Huemans/Catalog/Infrastructure/CatalogModule';
import { ColorDistributionModule } from '@Huemans/ColorDistribution/Infrastructure/ColorDistributionModule';
import { EventModule } from '@Huemans/Event/Infrastructure/EventModule';
import { ApplicationService } from '@Huemans/Participation/Application/ApplicationService';
import { EVENT_DIRECTORY } from '@Huemans/Participation/Domain/Port/EventDirectory';
import { GROUP_DIRECTORY } from '@Huemans/Participation/Domain/Port/GroupDirectory';
import { QUESTION_CATALOG } from '@Huemans/Participation/Domain/Port/QuestionCatalog';
import { SENTENCE_TRAIT_WEIGHER } from '@Huemans/Participation/Domain/Port/SentenceTraitWeigher';
import { config } from '@Huemans/config';
import { CatalogQuestionCatalog } from './Catalog/CatalogQuestionCatalog';
import { ColorDistributionGroupDirectory } from './ColorDistribution/ColorDistributionGroupDirectory';
import { EventContextDirectory } from './Event/EventContextDirectory';
import { AnswersController } from './Http/AnswersController';
import { JevSentenceTraitWeigher } from './Jev/JevSentenceTraitWeigher';

@Module({
  imports: [CatalogModule, EventModule, ColorDistributionModule],
  controllers: [AnswersController],
  providers: [
    ApplicationService,
    { provide: EVENT_DIRECTORY, useClass: EventContextDirectory },
    { provide: QUESTION_CATALOG, useClass: CatalogQuestionCatalog },
    { provide: SENTENCE_TRAIT_WEIGHER, useFactory: () => new JevSentenceTraitWeigher(config.jev) },
    { provide: GROUP_DIRECTORY, useClass: ColorDistributionGroupDirectory },
  ],
})
export class ParticipationModule {}
