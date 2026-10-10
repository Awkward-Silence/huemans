import { AnswerText } from '@Huemans/Catalog/Domain/ValueObject/AnswerText';
import { Blurb } from '@Huemans/Catalog/Domain/ValueObject/Blurb';
import { IcebreakerText } from '@Huemans/Catalog/Domain/ValueObject/IcebreakerText';
import { Nickname } from '@Huemans/Catalog/Domain/ValueObject/Nickname';
import { QuestionText } from '@Huemans/Catalog/Domain/ValueObject/QuestionText';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';

const ofLength = (length: number) => 'x'.repeat(length);

describe('Catalog texts', () => {
  it.each([
    ['QuestionText', (value: string) => new QuestionText(value), 80],
    ['AnswerText', (value: string) => new AnswerText(value), 80],
    ['Nickname', (value: string) => new Nickname(value), 80],
    ['IcebreakerText', (value: string) => new IcebreakerText(value), 200],
    ['Blurb', (value: string) => new Blurb(value), 200],
  ])('testThe%sLimit', (_name, create, limit) => {
    expect(create(ofLength(limit)).value).toHaveLength(limit);
    expect(() => create(ofLength(limit + 1))).toThrow(InvalidArgumentError);
    expect(() => create('')).toThrow(InvalidArgumentError);
  });

  it('testNicknameIsStoredTrimmed', () => {
    expect(new Nickname('  The Planners  ').value).toBe('The Planners');
  });

  it('testNicknameLimitCountsTheTrimmedValue', () => {
    expect(new Nickname(` ${ofLength(80)} `).value).toHaveLength(80);
  });

  it('testBlankNicknameIsRejected', () => {
    expect(() => new Nickname('   ')).toThrow(InvalidArgumentError);
  });
});
