import { Inject, Injectable } from '@nestjs/common';
import { ICEBREAKER_REPOSITORY, IcebreakerRepository } from '@Huemans/Catalog/Domain/Port/IcebreakerRepository';
import { QUESTION_REPOSITORY, QuestionRepository } from '@Huemans/Catalog/Domain/Port/QuestionRepository';
import { AnswerChoice, QuestionSelection } from '@Huemans/Catalog/Domain/QuestionSelection';
import { TRANSACTION_MANAGER, TransactionManager } from '@Huemans/Shared/Domain/Port/TransactionManager';
import type { Icebreaker } from '@Huemans/Types/Icebreaker';
import type { PersonalityTypeValue } from '@Huemans/Types/PersonalityType';
import type { Question } from '@Huemans/Types/Question';
import type { TraitValue } from '@Huemans/Types/Trait';
import { TRAIT_TYPES } from '@Huemans/Types/TraitTypeMapping';

/** In-process read API of the catalog for the other contexts, plus the seed. */
@Injectable()
export class ApplicationService {
  constructor(
    @Inject(QUESTION_REPOSITORY) private readonly questionRepository: QuestionRepository,
    @Inject(ICEBREAKER_REPOSITORY) private readonly icebreakerRepository: IcebreakerRepository,
    @Inject(TRANSACTION_MANAGER) private readonly transaction: TransactionManager,
  ) {}

  questions(): Promise<Question[]> {
    return this.questionRepository.all();
  }

  async questionsByIds(ids: string[]): Promise<QuestionSelection> {
    return QuestionSelection.of(ids, await this.questionRepository.byIds(ids));
  }

  async traitsOf(choices: AnswerChoice[]): Promise<TraitValue[]> {
    const selection = await this.questionsByIds([...new Set(choices.map((choice) => choice.questionId))]);
    return selection.traitsOf(choices);
  }

  icebreakers(): Promise<Icebreaker[]> {
    return this.icebreakerRepository.all();
  }

  traitTypeMapping(): Record<TraitValue, PersonalityTypeValue> {
    return TRAIT_TYPES;
  }

  /** Both lists must already be validated against the content schemas. */
  async seed(questions: Question[], icebreakers: Icebreaker[]): Promise<void> {
    await this.transaction.run(async () => {
      await this.questionRepository.upsert(questions);
      await this.icebreakerRepository.upsert(icebreakers);
    });
  }
}
