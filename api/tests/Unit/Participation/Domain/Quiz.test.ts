import { Quiz } from '@Huemans/Participation/Domain/Quiz';
import { QuizQuestion } from '@Huemans/Participation/Domain/ValueObject/QuizQuestion';
import { QuizSettings } from '@Huemans/Participation/Domain/ValueObject/QuizSettings';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

function aQuestion(id: string, theme: string): QuizQuestion {
  return QuizQuestion.fromPrimitives({
    id,
    theme,
    text: `Question ${id}`,
    answers: ['a', 'b', 'c', 'd'].map((letter) => ({ id: `${id}-${letter}`, text: `Answer ${letter}` })),
  });
}

describe('Quiz', () => {
  let settings: QuizSettings;
  let catalog: QuizQuestion[];
  let eventId: EventId;

  beforeEach(() => {
    settings = QuizSettings.standard();
    const themes = ['home', 'money', 'food', 'travel', 'work', 'love', 'school', 'sports'];
    catalog = Array.from({ length: 24 }, (_, index) =>
      aQuestion(`q${String(index + 1).padStart(4, '0')}`, themes[index % themes.length]),
    );
    eventId = EventId.random();
  });

  function idsOf(quiz: Quiz): string[] {
    return quiz.toDTO().questions.map((question) => question.id);
  }

  it('testTheStandardSettingsAreFiveQuestionsInTwentySeconds', () => {
    expect(settings.toPrimitives()).toEqual({ questionCount: 5, durationSeconds: 20 });
  });

  it('testTheSameEventGetsTheSameQuestionsInTheSameOrder', () => {
    expect(idsOf(Quiz.for(eventId, catalog, settings))).toEqual(idsOf(Quiz.for(eventId, catalog, settings)));
  });

  it('testTheCatalogOrderDoesNotChangeTheQuiz', () => {
    expect(idsOf(Quiz.for(eventId, [...catalog].reverse(), settings))).toEqual(
      idsOf(Quiz.for(eventId, catalog, settings)),
    );
  });

  it('testEventsDoNotAllGetTheSameQuiz', () => {
    const quizzes = Array.from({ length: 10 }, () => idsOf(Quiz.for(EventId.random(), catalog, settings)).join());

    expect(new Set(quizzes).size).toBeGreaterThan(1);
  });

  it('testItAsksTheSettingsQuestionCountFromDifferentThemes', () => {
    const questions = Quiz.for(eventId, catalog, settings).toDTO().questions;

    expect(questions).toHaveLength(5);
    expect(new Set(questions.map((question) => question.theme)).size).toBe(5);
  });

  it('testItRepeatsThemesOnlyWhenTheCatalogRunsOutOfThem', () => {
    const fewThemes = catalog.filter((question) => ['home', 'money', 'food'].includes(question.theme));

    const questions = Quiz.for(eventId, fewThemes, settings).toDTO().questions;

    expect(questions).toHaveLength(5);
    expect(new Set(questions.map((question) => question.theme))).toEqual(new Set(['home', 'money', 'food']));
  });

  it('testAnswersKeepTheirCatalogOrder', () => {
    const [question] = Quiz.for(eventId, catalog, settings).toDTO().questions;

    expect(question.answers.map((answer) => answer.id)).toEqual(['a', 'b', 'c', 'd'].map((l) => `${question.id}-${l}`));
  });

  it('testTheQuizCarriesTheDuration', () => {
    expect(Quiz.for(eventId, catalog, settings).toDTO().durationSeconds).toBe(20);
  });
});
