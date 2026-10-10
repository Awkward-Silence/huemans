import { INestApplication } from '@nestjs/common';
import { EventCreated } from '@Huemans/Event/Domain/EventCreated';
import { DomainEvent } from '@Huemans/Shared/Domain/DomainEvent';
import { recordPublished } from '../../Support/events';
import { bootFunctional, postJson } from '../../Support/functional';

describe('POST /events validation', () => {
  let app: INestApplication;
  let published: DomainEvent[];

  beforeAll(async () => {
    app = await bootFunctional();
    published = recordPublished(app, EventCreated.EVENT_NAME);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    published.length = 0;
  });

  it('testRejectsABlankName', async () => {
    expect((await postJson(app, '/events', { name: '   ' })).status).toBe(400);
    expect(published).toHaveLength(0);
  });

  it('testRejectsAMissingName', async () => {
    expect((await postJson(app, '/events', {})).status).toBe(400);
    expect(published).toHaveLength(0);
  });

  it('testRejectsANameThatIsNotText', async () => {
    expect((await postJson(app, '/events', { name: 42 })).status).toBe(400);
    expect(published).toHaveLength(0);
  });

  it('testAcceptsANameOf255Characters', async () => {
    expect((await postJson(app, '/events', { name: 'a'.repeat(255) })).status).toBe(201);
  });

  it('testRejectsANameOf256Characters', async () => {
    expect((await postJson(app, '/events', { name: 'a'.repeat(256) })).status).toBe(400);
    expect(published).toHaveLength(0);
  });
});
