import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Icebreaker } from '@Huemans/Catalog/Domain/Icebreaker';
import { PersonalityTypeProfile } from '@Huemans/Catalog/Domain/PersonalityTypeProfile';
import { PersonalityTypeProfileNotFound } from '@Huemans/Catalog/Domain/PersonalityTypeProfileNotFound';
import { CatalogRepository } from '@Huemans/Catalog/Domain/Port/CatalogRepository';
import { Question } from '@Huemans/Catalog/Domain/Question';
import { TraitTypeMapping } from '@Huemans/Catalog/Domain/TraitTypeMapping';
import { Answer } from '@Huemans/Catalog/Domain/ValueObject/Answer';
import { AnswerCollection } from '@Huemans/Catalog/Domain/ValueObject/AnswerCollection';
import { AnswerId } from '@Huemans/Catalog/Domain/ValueObject/AnswerId';
import { IcebreakerId } from '@Huemans/Catalog/Domain/ValueObject/IcebreakerId';
import { IcebreakerTraitCollection } from '@Huemans/Catalog/Domain/ValueObject/IcebreakerTraitCollection';
import { ProfileTraitCollection } from '@Huemans/Catalog/Domain/ValueObject/ProfileTraitCollection';
import { QuestionId } from '@Huemans/Catalog/Domain/ValueObject/QuestionId';
import { Theme } from '@Huemans/Catalog/Domain/ValueObject/Theme';
import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { CatalogAnswerSchema } from './CatalogAnswerSchema';
import { CatalogIcebreakerSchema } from './CatalogIcebreakerSchema';
import { CatalogPersonalityTypeProfileSchema } from './CatalogPersonalityTypeProfileSchema';
import { CatalogQuestionSchema } from './CatalogQuestionSchema';
import { CatalogTraitTypeSchema } from './CatalogTraitTypeSchema';

// Rows are rebuilt into read models here, so the value objects check everything that leaves the repository.
@Injectable()
export class MikroOrmCatalogRepository implements CatalogRepository {
  constructor(private readonly em: EntityManager) {}

  async allQuestions(): Promise<Question[]> {
    const questions = await this.em.find(
      CatalogQuestionSchema,
      {},
      { orderBy: { id: 'asc' }, disableIdentityMap: true },
    );
    const answers = await this.em.find(
      CatalogAnswerSchema,
      {},
      { orderBy: { position: 'asc' }, disableIdentityMap: true },
    );

    return questions.map(
      (question) =>
        new Question(
          new QuestionId(question.id),
          new Theme(question.theme),
          question.text,
          new AnswerCollection(
            answers
              .filter((answer) => answer.questionId === question.id)
              .map((answer) => new Answer(new AnswerId(answer.id), answer.text, new Trait(answer.trait))),
          ),
        ),
    );
  }

  async allIcebreakers(): Promise<Icebreaker[]> {
    const rows = await this.em.find(CatalogIcebreakerSchema, {}, { orderBy: { id: 'asc' }, disableIdentityMap: true });
    return rows.map(
      (row) =>
        new Icebreaker(
          new IcebreakerId(row.id),
          new Theme(row.theme),
          row.text,
          new IcebreakerTraitCollection(row.traits.map((trait) => new Trait(trait))),
        ),
    );
  }

  async profileOf(type: PersonalityType): Promise<PersonalityTypeProfile> {
    const row = await this.em.findOne(
      CatalogPersonalityTypeProfileSchema,
      { type: type.value },
      { disableIdentityMap: true },
    );
    if (row === null) {
      throw new PersonalityTypeProfileNotFound(type);
    }
    return new PersonalityTypeProfile(
      type,
      row.nickname,
      row.blurb,
      new ProfileTraitCollection(row.traits.map((trait) => new Trait(trait))),
    );
  }

  async mapping(): Promise<TraitTypeMapping> {
    const rows = await this.em.find(
      CatalogTraitTypeSchema,
      {},
      { orderBy: { trait: 'asc' }, disableIdentityMap: true },
    );
    return new TraitTypeMapping(
      rows.map((row) => [new Trait(row.trait), new PersonalityType(row.personalityType)] as const),
    );
  }
}
