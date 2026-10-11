import { SentenceAnswer } from '@Huemans/Participation/Domain/ValueObject/SentenceAnswer';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';

describe('SentenceAnswer', () => {
  it('testTrimsTheQuestionAndTheAnswer', () => {
    const sentence = new SentenceAnswer('  Finish the sentence ', ' I secretly nap at weddings ');

    expect([sentence.question, sentence.answer]).toEqual(['Finish the sentence', 'I secretly nap at weddings']);
  });

  it.each([
    ['', 'I nap'],
    ['Finish it', '   '],
    ['Finish it', 'x'.repeat(301)],
  ])('testRejectsAnEmptyOrOverlongText %#', (question, answer) => {
    expect(() => new SentenceAnswer(question, answer)).toThrow(InvalidArgumentError);
  });
});
