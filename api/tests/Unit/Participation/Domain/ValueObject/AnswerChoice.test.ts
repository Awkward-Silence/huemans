import { AnswerChoice } from '@Huemans/Participation/Domain/ValueObject/AnswerChoice';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';

describe('AnswerChoice', () => {
  it('testKeepsTheCatalogIds', () => {
    expect(new AnswerChoice('q0051', 'q0051-a').key()).toBe('q0051/q0051-a');
  });

  it.each([
    ['', 'q0051-a'],
    ['q0051', ' '],
  ])('testRejectsAMissingId %#', (questionId, answerId) => {
    expect(() => new AnswerChoice(questionId, answerId)).toThrow(InvalidArgumentError);
  });
});
