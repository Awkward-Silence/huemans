import { EntityManager } from '@mikro-orm/postgresql';
import { TestingModule } from '@nestjs/testing';
import { Attendee } from '@Huemans/Participation/Domain/Attendee';
import { AttendeeName } from '@Huemans/Participation/Domain/ValueObject/AttendeeName';
import { AttendeeSchema } from '@Huemans/Participation/Infrastructure/Persistence/MikroOrm/AttendeeSchema';
import { MikroOrmAttendeeRepository } from '@Huemans/Participation/Infrastructure/Persistence/MikroOrm/MikroOrmAttendeeRepository';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { bootIntegration } from '../../../../Support/integration';

describe('MikroOrmAttendeeRepository', () => {
  let module: TestingModule;
  let repository: MikroOrmAttendeeRepository;
  let em: EntityManager;
  let eventId: EventId;

  beforeAll(async () => {
    module = await bootIntegration({ entities: [AttendeeSchema], providers: [MikroOrmAttendeeRepository] });
  });

  afterAll(async () => {
    await module.close();
  });

  // No truncation: every test uses a fresh event id, and functional suites share this table in parallel.
  beforeEach(() => {
    repository = module.get(MikroOrmAttendeeRepository);
    em = module.get(EntityManager);
    eventId = EventId.random();
  });

  function anAttendeeOf(event: EventId, name = 'Ana'): Attendee {
    return Attendee.join(AttendeeId.random(), event, new AttendeeName(name), new Date('2026-10-25T20:00:00.000Z'));
  }

  it('testSavesAndFindsAnAttendeeInItsEvent', async () => {
    const attendee = anAttendeeOf(eventId);
    await repository.save(attendee);
    em.clear();

    const found = await repository.searchIn(eventId, attendee.id);

    expect(found).toBeInstanceOf(Attendee);
    expect(found?.toDTO()).toEqual(attendee.toDTO());
  });

  it('testFindsNothingInAnotherEvent', async () => {
    const attendee = anAttendeeOf(eventId);
    await repository.save(attendee);
    em.clear();

    expect(await repository.searchIn(EventId.random(), attendee.id)).toBeNull();
  });

  it('testFindsNothingForAnAttendeeWhoNeverJoined', async () => {
    expect(await repository.searchIn(eventId, AttendeeId.random())).toBeNull();
  });

  it('testCountsOnlyThatEventsAttendees', async () => {
    await repository.save(anAttendeeOf(eventId, 'Ana'));
    await repository.save(anAttendeeOf(eventId, 'Ana'));
    await repository.save(anAttendeeOf(EventId.random()));

    expect((await repository.countIn(eventId)).value).toBe(2);
    expect((await repository.countIn(EventId.random())).value).toBe(0);
  });
});
