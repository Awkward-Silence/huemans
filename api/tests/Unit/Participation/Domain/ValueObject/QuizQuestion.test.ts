import { QuizQuestion } from '@Huemans/Participation/Domain/ValueObject/QuizQuestion';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';

describe('QuizQuestion', () => {
  const answers = ['a', 'b', 'c', 'd'].map((letter) => ({ id: `q0001-${letter}`, text: `Answer ${letter}` }));

  it('testKeepsItsFieldsWithoutTraits', () => {
    const question = QuizQuestion.fromPrimitives({ id: 'q0001', theme: 'home', text: 'Why?', answers });

    expect(question.toPrimitives()).toEqual({ id: 'q0001', theme: 'home', text: 'Why?', answers });
  });

  it('testRejectsAQuestionWithoutFourAnswers', () => {
    expect(() =>
      QuizQuestion.fromPrimitives({ id: 'q0001', theme: 'home', text: 'Why?', answers: answers.slice(1) }),
    ).toThrow(InvalidArgumentError);
  });

  it.each([
    [{ id: '', theme: 'home', text: 'Why?' }],
    [{ id: 'q0001', theme: '', text: 'Why?' }],
    [{ id: 'q0001', theme: 'home', text: ' ' }],
  ])('testRejectsAnEmptyField %p', (fields) => {
    expect(() => QuizQuestion.fromPrimitives({ ...fields, answers })).toThrow(InvalidArgumentError);
  });
});
