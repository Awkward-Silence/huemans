import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Icebreaker } from '@Huemans/Catalog/Domain/Icebreaker';
import { PersonalityTypeProfile } from '@Huemans/Catalog/Domain/PersonalityTypeProfile';
import { PersonalityTypes } from '@Huemans/Catalog/Domain/PersonalityTypes';
import { PersonalityTypesNotDefined } from '@Huemans/Catalog/Domain/PersonalityTypesNotDefined';
import { CatalogRepository } from '@Huemans/Catalog/Domain/Port/CatalogRepository';
import { Question } from '@Huemans/Catalog/Domain/Question';
import { PersonalityTypeProfileCollection } from '@Huemans/Catalog/Domain/ValueObject/PersonalityTypeProfileCollection';
import { TraitType } from '@Huemans/Catalog/Domain/ValueObject/TraitType';
import { TraitTypeMapping } from '@Huemans/Catalog/Domain/ValueObject/TraitTypeMapping';
import { Answer } from '@Huemans/Catalog/Domain/Answer';
import { AnswerText } from '@Huemans/Catalog/Domain/ValueObject/AnswerText';
import { IcebreakerText } from '@Huemans/Catalog/Domain/ValueObject/IcebreakerText';
import { QuestionText } from '@Huemans/Catalog/Domain/ValueObject/QuestionText';
import { Blurb } from '@Huemans/Catalog/Domain/ValueObject/Blurb';
import { Nickname } from '@Huemans/Catalog/Domain/ValueObject/Nickname';
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

    return questions.map((question) =>
      Question.rebuild(
        new QuestionId(question.id),
        new Theme(question.theme),
        new QuestionText(question.text),
        new AnswerCollection(
          answers
            .filter((answer) => answer.questionId === question.id)
            .map((answer) => new Answer(new AnswerId(answer.id), new AnswerText(answer.text), new Trait(answer.trait))),
        ),
      ),
    );
  }

  async allIcebreakers(): Promise<Icebreaker[]> {
    const rows = await this.em.find(CatalogIcebreakerSchema, {}, { orderBy: { id: 'asc' }, disableIdentityMap: true });
    return rows.map((row) =>
      Icebreaker.rebuild(
        new IcebreakerId(row.id),
        new Theme(row.theme),
        new IcebreakerText(row.text),
        new IcebreakerTraitCollection(row.traits.map((trait) => new Trait(trait))),
      ),
    );
  }

  async personalityTypes(): Promise<PersonalityTypes> {
    const [profiles, traitTypes] = await Promise.all([
      this.em.find(CatalogPersonalityTypeProfileSchema, {}, { disableIdentityMap: true }),
      this.em.find(CatalogTraitTypeSchema, {}, { orderBy: { trait: 'asc' }, disableIdentityMap: true }),
    ]);
    if (profiles.length === 0 || traitTypes.length === 0) {
      throw new PersonalityTypesNotDefined();
    }
    return PersonalityTypes.rebuild(
      new TraitTypeMapping(
        traitTypes.map((row) => new TraitType(new Trait(row.trait), new PersonalityType(row.personalityType))),
      ),
      new PersonalityTypeProfileCollection(
        profiles.map(
          (row) =>
            new PersonalityTypeProfile(
              new PersonalityType(row.type),
              new Nickname(row.nickname),
              new Blurb(row.blurb),
              new ProfileTraitCollection(row.traits.map((trait) => new Trait(trait))),
            ),
        ),
      ),
    );
  }

  async saveQuestions(questions: Question[]): Promise<void> {
    await this.em.insertMany(
      CatalogQuestionSchema,
      questions.map(({ id, theme, text }) => ({ id: id.value, theme: theme.value, text: text.value })),
    );
    await this.em.insertMany(
      CatalogAnswerSchema,
      questions.flatMap((question) =>
        question.answers.all().map(({ id, text, trait }, position) => ({
          id: id.value,
          questionId: question.id.value,
          position,
          text: text.value,
          trait: trait.value,
        })),
      ),
    );
  }

  async saveIcebreakers(icebreakers: Icebreaker[]): Promise<void> {
    await this.em.insertMany(
      CatalogIcebreakerSchema,
      icebreakers.map(({ id, theme, text, traits }) => ({
        id: id.value,
        theme: theme.value,
        text: text.value,
        traits: traits.all().map((trait) => trait.value),
      })),
    );
  }

  async savePersonalityTypes(personalityTypes: PersonalityTypes): Promise<void> {
    const { mapping, profiles } = personalityTypes.toDTO();
    await this.em.insertMany(CatalogPersonalityTypeProfileSchema, profiles);
    await this.em.insertMany(
      CatalogTraitTypeSchema,
      Object.entries(mapping).map(([trait, personalityType]) => ({ trait, personalityType })),
    );
  }
}
