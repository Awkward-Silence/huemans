import { Module } from '@nestjs/common';
import { ApplicationService } from '@Huemans/Catalog/Application/ApplicationService';
import { ICEBREAKER_REPOSITORY } from '@Huemans/Catalog/Domain/Port/IcebreakerRepository';
import { QUESTION_REPOSITORY } from '@Huemans/Catalog/Domain/Port/QuestionRepository';
import { MikroOrmIcebreakerRepository } from './Persistence/MikroOrm/MikroOrmIcebreakerRepository';
import { MikroOrmQuestionRepository } from './Persistence/MikroOrm/MikroOrmQuestionRepository';

@Module({
  providers: [
    ApplicationService,
    { provide: QUESTION_REPOSITORY, useClass: MikroOrmQuestionRepository },
    { provide: ICEBREAKER_REPOSITORY, useClass: MikroOrmIcebreakerRepository },
  ],
  exports: [ApplicationService],
})
export class CatalogModule {}
