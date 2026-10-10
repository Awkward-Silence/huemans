import { Answer } from '@Huemans/Catalog/Domain/Answer';
import { QuestionAuthored } from '@Huemans/Catalog/Domain/Event/QuestionAuthored';
import { Question } from '@Huemans/Catalog/Domain/Question';
import { AnswerCollection } from '@Huemans/Catalog/Domain/ValueObject/AnswerCollection';
import { AnswerId } from '@Huemans/Catalog/Domain/ValueObject/AnswerId';
import { AnswerText } from '@Huemans/Catalog/Domain/ValueObject/AnswerText';
import { QuestionId } from '@Huemans/Catalog/Domain/ValueObject/QuestionId';
import { QuestionText } from '@Huemans/Catalog/Domain/ValueObject/QuestionText';
import { Theme } from '@Huemans/Catalog/Domain/ValueObject/Theme';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';

describe('Question', () => {
  let id: QuestionId;
  let theme: Theme;
  let text: QuestionText;
  let answers: AnswerCollection;

  beforeEach(() => {
    id = new QuestionId('q0001');
    theme = new Theme('home');
    text = new QuestionText('Your ideal Sunday?');
    answers = new AnswerCollection(
      ['curious', 'loyal', 'honest', 'thrifty'].map(
        (trait, index) =>
          new Answer(new AnswerId(`q0001-${'abcd'[index]}`), new AnswerText(`Answer ${index}`), new Trait(trait)),
      ),
    );
  });

  it('testAuthoringRecordsQuestionAuthoredOnce', () => {
    const question = Question.author(id, theme, text, answers);

    const events = question.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(QuestionAuthored);
    expect(events[0].aggregateId).toBe('q0001');
    expect(question.pullDomainEvents()).toEqual([]);
  });

  it('testRebuildingRecordsNothing', () => {
    expect(Question.rebuild(id, theme, text, answers).pullDomainEvents()).toEqual([]);
  });

  it('testToDTOKeepsTheContract', () => {
    expect(Question.rebuild(id, theme, text, answers).toDTO()).toEqual({
      id: 'q0001',
      theme: 'home',
      text: 'Your ideal Sunday?',
      answers: [
        { id: 'q0001-a', text: 'Answer 0', trait: 'curious' },
        { id: 'q0001-b', text: 'Answer 1', trait: 'loyal' },
        { id: 'q0001-c', text: 'Answer 2', trait: 'honest' },
        { id: 'q0001-d', text: 'Answer 3', trait: 'thrifty' },
      ],
    });
  });
});
