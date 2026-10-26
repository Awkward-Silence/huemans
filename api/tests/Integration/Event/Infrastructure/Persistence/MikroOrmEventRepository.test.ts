import { TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/postgresql';
import { Event } from '@Huemans/Event/Domain/Event';
import { EventName } from '@Huemans/Event/Domain/ValueObject/EventName';
import { EventSchema } from '@Huemans/Event/Infrastructure/Persistence/MikroOrm/EventSchema';
import { MikroOrmEventRepository } from '@Huemans/Event/Infrastructure/Persistence/MikroOrm/MikroOrmEventRepository';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { bootIntegration } from '../../../../Support/integration';

describe('MikroOrmEventRepository', () => {
  let module: TestingModule;
  let repository: MikroOrmEventRepository;
  let em: EntityManager;
  let id: EventId;

  beforeAll(async () => {
    module = await bootIntegration({ entities: [EventSchema], providers: [MikroOrmEventRepository] });
  });

  afterAll(async () => {
    await module.close();
  });

  // No truncation: every test uses a fresh event id, and functional suites share this table in parallel.
  beforeEach(() => {
    repository = module.get(MikroOrmEventRepository);
    em = module.get(EntityManager);
    id = EventId.random();
  });

  it('testItSavesAndReloadsAnEvent', async () => {
    await repository.save(Event.create(id, new EventName('Demo night')));
    em.clear();

    const reloaded = await repository.search(id);

    expect(reloaded).toBeInstanceOf(Event);
    expect(reloaded?.toDTO()).toEqual({ id: id.value, name: 'Demo night', status: 'open' });
  });

  it('testItFindsNothingForAnUnknownEvent', async () => {
    expect(await repository.search(EventId.random())).toBeNull();
  });

  it('testItPersistsTheRevealedStatusFoundForUpdate', async () => {
    await repository.save(Event.create(id, new EventName('Demo night')));
    em.clear();

    await em.transactional(async () => {
      const event = await repository.searchForUpdate(id);
      event!.reveal();
      await repository.save(event!);
    });
    em.clear();

    expect((await repository.search(id))?.toDTO().status).toBe('revealed');
  });
});
