import { INestApplication } from '@nestjs/common';
import type { EventResponse } from '../../../../contracts/event';
import { ICEBREAKER_CATALOG } from '@Huemans/NightIcebreaker/Domain/Port/IcebreakerCatalog';
import { IcebreakerCandidate } from '@Huemans/NightIcebreaker/Domain/ValueObject/IcebreakerCandidate';
import { bootFunctional, getJson, postJson } from '../../Support/functional';

describe('A reveal whose pick fails', () => {
  let app: INestApplication;
  let candidates: jest.Mock<Promise<IcebreakerCandidate[]>, []>;
  let eventId: string;

  beforeAll(async () => {
    candidates = jest.fn<Promise<IcebreakerCandidate[]>, []>();
    app = await bootFunctional({ overrides: [{ provide: ICEBREAKER_CATALOG, useValue: { candidates } }] });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    candidates
      .mockReset()
      .mockRejectedValueOnce(new Error('catalog unavailable'))
      .mockResolvedValue([IcebreakerCandidate.fromPrimitives({ id: 'i0001', text: 'Why?', traits: ['curious'] })]);
    eventId = ((await postJson(app, '/events', { name: 'Demo night' })).body as EventResponse).id;
  });

  it('testLeavesTheEventOpen', async () => {
    expect((await postJson(app, `/events/${eventId}/reveal`, {})).status).toBe(500);

    expect((await getJson(app, `/events/${eventId}`)).body).toMatchObject({ status: 'open' });
  });

  it('testCanBeRetried', async () => {
    await postJson(app, `/events/${eventId}/reveal`, {});

    expect((await postJson(app, `/events/${eventId}/reveal`, {})).status).toBe(200);
    expect((await getJson(app, `/events/${eventId}/icebreaker`)).body).toMatchObject({
      status: 'ready',
      question: 'Why?',
    });
  });
});
