import { Injectable } from '@nestjs/common';
import { ApplicationService as CatalogService } from '@Huemans/Catalog/Application/ApplicationService';
import { QuestionCatalog } from '@Huemans/Participation/Domain/Port/QuestionCatalog';
import { AnswerChoice } from '@Huemans/Participation/Domain/ValueObject/AnswerChoice';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';

@Injectable()
export class CatalogQuestionCatalog implements QuestionCatalog {
  constructor(private readonly catalog: CatalogService) {}

  async traitsOf(choices: readonly AnswerChoice[]): Promise<Trait[]> {
    const traits = new Map<string, Trait>();
    for (const question of await this.catalog.allQuestions()) {
      for (const answer of question.answers) {
        traits.set(new AnswerChoice(question.id, answer.id).key(), new Trait(answer.trait));
      }
    }

    return choices.flatMap((choice) => traits.get(choice.key()) ?? []);
  }
}
