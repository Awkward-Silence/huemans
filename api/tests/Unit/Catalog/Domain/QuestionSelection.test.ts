import { QuestionSelection } from '@Huemans/Catalog/Domain/QuestionSelection';
import type { Question } from '@Huemans/Types/Question';

function question(id: string, traits: Question['answers'][number]['trait'][]): Question {
  return {
    id,
    theme: 'home',
    text: `Question ${id}`,
    answers: traits.map((trait, index) => ({ id: `${id}-${'abcd'[index]}`, text: trait, trait })),
  };
}

describe('QuestionSelection', () => {
  const q1 = question('q0001', ['dramatic', 'curious', 'practical', 'optimistic']);
  const q2 = question('q0002', ['loyal', 'chaotic', 'thrifty', 'romantic']);

  it('testKeepsTheRequestedOrder', () => {
    const selection = QuestionSelection.of(['q0002', 'q0001'], [q1, q2]);

    expect(selection.questions.map((found) => found.id)).toEqual(['q0002', 'q0001']);
    expect(selection.missing).toEqual([]);
  });

  it('testReportsUnknownIds', () => {
    const selection = QuestionSelection.of(['q0001', 'q9999'], [q1]);

    expect(selection.questions).toEqual([q1]);
    expect(selection.missing).toEqual(['q9999']);
  });

  it('testResolvesTraitsInOrderWithRepeats', () => {
    const selection = QuestionSelection.of(['q0001', 'q0002'], [q1, q2]);

    expect(
      selection.traitsOf([
        { questionId: 'q0001', answerId: 'q0001-c' },
        { questionId: 'q0002', answerId: 'q0002-a' },
        { questionId: 'q0001', answerId: 'q0001-c' },
      ]),
    ).toEqual(['practical', 'loyal', 'practical']);
  });

  it('testIgnoresUnknownAndMismatchedChoices', () => {
    const selection = QuestionSelection.of(['q0001', 'q0002'], [q1, q2]);

    expect(
      selection.traitsOf([
        { questionId: 'q0001', answerId: 'q0001-c' },
        { questionId: 'q0001', answerId: 'q0002-a' },
        { questionId: 'q9999', answerId: 'q9999-a' },
      ]),
    ).toEqual(['practical']);
  });
});
