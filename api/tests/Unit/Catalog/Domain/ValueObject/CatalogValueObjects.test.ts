import { Answer } from '@Huemans/Catalog/Domain/ValueObject/Answer';
import { AnswerCollection } from '@Huemans/Catalog/Domain/ValueObject/AnswerCollection';
import { AnswerId } from '@Huemans/Catalog/Domain/ValueObject/AnswerId';
import { IcebreakerId } from '@Huemans/Catalog/Domain/ValueObject/IcebreakerId';
import { IcebreakerTraitCollection } from '@Huemans/Catalog/Domain/ValueObject/IcebreakerTraitCollection';
import { ProfileTraitCollection } from '@Huemans/Catalog/Domain/ValueObject/ProfileTraitCollection';
import { QuestionId } from '@Huemans/Catalog/Domain/ValueObject/QuestionId';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';

const answer = (id: string, trait = 'curious') => new Answer(new AnswerId(id), `Answer ${id}`, new Trait(trait));
const traits = (...values: string[]) => values.map((value) => new Trait(value));

describe('Catalog value objects', () => {
  it('testIdsRejectEmptyStrings', () => {
    expect(() => new QuestionId('')).toThrow(InvalidArgumentError);
    expect(() => new AnswerId('  ')).toThrow(InvalidArgumentError);
    expect(() => new IcebreakerId('')).toThrow(InvalidArgumentError);
    expect(new QuestionId('q0001').value).toBe('q0001');
  });

  it('testAnswerNeedsAText', () => {
    expect(() => new Answer(new AnswerId('q0001-a'), '', new Trait('curious'))).toThrow(InvalidArgumentError);
  });

  it('testAnswerCollectionHoldsExactlyFourAnswersInOrder', () => {
    const answers = [answer('a'), answer('b'), answer('c'), answer('d')];

    expect(new AnswerCollection(answers).all()).toEqual(answers);
    expect(() => new AnswerCollection(answers.slice(0, 3))).toThrow(InvalidArgumentError);
    expect(() => new AnswerCollection([...answers, answer('e')])).toThrow(InvalidArgumentError);
  });

  it('testAnswerCollectionRejectsARepeatedAnswerId', () => {
    expect(() => new AnswerCollection([answer('a'), answer('a'), answer('c'), answer('d')])).toThrow(
      InvalidArgumentError,
    );
  });

  it('testIcebreakerTraitsAreOneToThreeDistinct', () => {
    expect(new IcebreakerTraitCollection(traits('curious')).count()).toBe(1);
    expect(new IcebreakerTraitCollection(traits('curious', 'loyal', 'honest')).count()).toBe(3);
    expect(() => new IcebreakerTraitCollection([])).toThrow(InvalidArgumentError);
    expect(() => new IcebreakerTraitCollection(traits('curious', 'loyal', 'honest', 'thrifty'))).toThrow(
      InvalidArgumentError,
    );
    expect(() => new IcebreakerTraitCollection(traits('curious', 'curious'))).toThrow(InvalidArgumentError);
  });

  it('testProfileTraitsAreExactlyThreeDistinct', () => {
    expect(new ProfileTraitCollection(traits('curious', 'loyal', 'honest')).count()).toBe(3);
    expect(() => new ProfileTraitCollection(traits('curious', 'loyal'))).toThrow(InvalidArgumentError);
    expect(() => new ProfileTraitCollection(traits('curious', 'loyal', 'loyal'))).toThrow(InvalidArgumentError);
  });
});
