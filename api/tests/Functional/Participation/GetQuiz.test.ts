import { INestApplication } from '@nestjs/common';
import type { EventResponse } from '../../../contracts/event';
import type { QuizResponse } from '../../../contracts/participation';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { realContent, seedCatalogFiles } from '../../Support/catalog';
import { bootFunctional, getJson, postJson } from '../../Support/functional';

describe('GET /events/:eventId/quiz', () => {
  let app: INestApplication;
  let event: EventResponse;

  beforeAll(async () => {
    app = await bootFunctional();
    await seedCatalogFiles(app);
  });

  beforeEach(async () => {
    event = await createEvent();
  });

  afterAll(async () => {
    await app.close();
  });

  async function createEvent(): Promise<EventResponse> {
    return (await postJson(app, '/events', { name: 'Demo night' })).body as EventResponse;
  }

  async function quizOf(eventId = event.id): Promise<QuizResponse> {
    const response = await getJson(app, `/events/${eventId}/quiz`);
    expect(response.status).toBe(200);
    return response.body as QuizResponse;
  }

  function idsOf(quiz: QuizResponse): string[] {
    return quiz.questions.map((question) => question.id);
  }

  it('testServesFiveCatalogQuestionsWithoutTraits', async () => {
    const quiz = await quizOf();

    expect(quiz.durationSeconds).toBe(20);
    expect(quiz.questions).toHaveLength(5);
    for (const question of quiz.questions) {
      const seeded = realContent().questions.find((candidate) => candidate.id === question.id);
      expect(question).toEqual({
        id: seeded?.id,
        theme: seeded?.theme,
        text: seeded?.text,
        answers: seeded?.answers.map(({ id, text }) => ({ id, text })),
      });
    }
  });

  it('testEveryPhoneGetsTheSameQuiz', async () => {
    expect(idsOf(await quizOf())).toEqual(idsOf(await quizOf()));
  });

  it('testEventsDoNotAllGetTheSameQuiz', async () => {
    const quizzes = new Set<string>();
    for (let index = 0; index < 5; index++) {
      quizzes.add(idsOf(await quizOf((await createEvent()).id)).join());
    }

    expect(quizzes.size).toBeGreaterThan(1);
  });

  it('testTheQuestionsComeFromFiveThemes', async () => {
    const quiz = await quizOf();

    expect(new Set(quiz.questions.map((question) => question.theme)).size).toBe(5);
  });

  it('testARevealedEventKeepsItsQuiz', async () => {
    const before = await quizOf();
    await postJson(app, `/events/${event.id}/reveal`, {});

    expect(await quizOf()).toEqual(before);
  });

  it('testTheEventAndItsQuizAgree', async () => {
    const read = (await getJson(app, `/events/${event.id}`)).body as EventResponse;
    const quiz = await quizOf();

    expect(read.questionCount).toBe(quiz.questions.length);
    expect(read.quizDurationSeconds).toBe(quiz.durationSeconds);
  });

  it('testUnknownEventIsNotFound', async () => {
    expect((await getJson(app, `/events/${EventId.random().value}/quiz`)).status).toBe(404);
  });

  it('testMalformedEventIdIsBadRequest', async () => {
    expect((await getJson(app, '/events/not-a-uuid/quiz')).status).toBe(400);
  });
});
