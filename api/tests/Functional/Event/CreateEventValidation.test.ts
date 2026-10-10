import { INestApplication } from '@nestjs/common';
import { EventCreated } from '@Huemans/Event/Domain/EventCreated';
import { EVENT_REPOSITORY, EventRepository } from '@Huemans/Event/Domain/Port/EventRepository';
import { DomainEvent } from '@Huemans/Shared/Domain/DomainEvent';
import { recordPublished } from '../../Support/events';
import { bootFunctional, postJson } from '../../Support/functional';

describe('POST /events validation', () => {
  let app: INestApplication;
  let published: DomainEvent[];
  let save: jest.SpyInstance;

  const expectNothingCreated = (): void => {
    expect(published).toHaveLength(0);
    expect(save).not.toHaveBeenCalled();
  };

  beforeAll(async () => {
    app = await bootFunctional();
    published = recordPublished(app, EventCreated.EVENT_NAME);
    save = jest.spyOn(app.get<EventRepository>(EVENT_REPOSITORY), 'save');
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    published.length = 0;
    save.mockClear();
  });

  it('testRejectsABlankName', async () => {
    expect((await postJson(app, '/events', { name: '   ' })).status).toBe(400);
    expectNothingCreated();
  });

  it('testRejectsAMissingName', async () => {
    expect((await postJson(app, '/events', {})).status).toBe(400);
    expectNothingCreated();
  });

  it('testRejectsANameThatIsNotText', async () => {
    expect((await postJson(app, '/events', { name: 42 })).status).toBe(400);
    expectNothingCreated();
  });

  it('testAcceptsANameOf255Characters', async () => {
    expect((await postJson(app, '/events', { name: 'a'.repeat(255) })).status).toBe(201);
  });

  it('testRejectsANameOf256Characters', async () => {
    expect((await postJson(app, '/events', { name: 'a'.repeat(256) })).status).toBe(400);
    expectNothingCreated();
  });
});
