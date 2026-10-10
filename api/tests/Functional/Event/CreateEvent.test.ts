import { INestApplication } from '@nestjs/common';
import type { EventResponse } from '../../../../contracts/event';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { bootFunctional, postJson } from '../../Support/functional';

describe('POST /events', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await bootFunctional();
  });

  afterAll(async () => {
    await app.close();
  });

  it('testCreatesAnOpenEventWithTheQuizSettings', async () => {
    const response = await postJson(app, '/events', { name: 'Demo night' });
    const body = response.body as EventResponse;

    expect(response.status).toBe(201);
    expect(body).toEqual({
      id: body.id,
      name: 'Demo night',
      status: 'open',
      questionCount: 5,
      quizDurationSeconds: 20,
    });
    expect(new EventId(body.id).value).toBe(body.id);
  });

  it('testTwoEventsWithTheSameNameGetDifferentIds', async () => {
    const first = (await postJson(app, '/events', { name: 'Demo night' })).body as EventResponse;
    const second = (await postJson(app, '/events', { name: 'Demo night' })).body as EventResponse;

    expect(first.id).not.toBe(second.id);
  });

  it('testTrimsTheName', async () => {
    const response = await postJson(app, '/events', { name: '  Demo night  ' });

    expect((response.body as EventResponse).name).toBe('Demo night');
  });
});
