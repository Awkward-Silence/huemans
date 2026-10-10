import { TestingModule } from '@nestjs/testing';
import { EventDistribution } from '@Huemans/ColorDistribution/Domain/EventDistribution';
import { PersonalityType } from '@Huemans/ColorDistribution/Domain/ValueObject/PersonalityType';
import { TraitProfile } from '@Huemans/ColorDistribution/Domain/ValueObject/TraitProfile';
import { TraitTypeMapping } from '@Huemans/ColorDistribution/Domain/ValueObject/TraitTypeMapping';
import { AssignmentSchema } from '@Huemans/ColorDistribution/Infrastructure/Persistence/MikroOrm/AssignmentSchema';
import { EventDistributionSchema } from '@Huemans/ColorDistribution/Infrastructure/Persistence/MikroOrm/EventDistributionSchema';
import { MikroOrmEventDistributionRepository } from '@Huemans/ColorDistribution/Infrastructure/Persistence/MikroOrm/MikroOrmEventDistributionRepository';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { Trait, TRAITS } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { MikroOrmTransactionManager } from '@Huemans/Shared/Infrastructure/Persistence/MikroOrm/MikroOrmTransactionManager';
import { EntityManager } from '@mikro-orm/postgresql';
import { bootIntegration } from '../../../../Support/integration';

describe('MikroOrmEventDistributionRepository', () => {
  let module: TestingModule;
  let repository: MikroOrmEventDistributionRepository;
  let transaction: MikroOrmTransactionManager;
  let em: EntityManager;
  let eventId: EventId;
  let mapping: TraitTypeMapping;
  let curious: TraitProfile;

  beforeAll(async () => {
    module = await bootIntegration({
      entities: [EventDistributionSchema, AssignmentSchema],
      providers: [MikroOrmEventDistributionRepository, MikroOrmTransactionManager],
    });
  });

  afterAll(async () => {
    await module.close();
  });

  // No truncation: every test uses a fresh event id, and functional suites share these tables in parallel.
  beforeEach(() => {
    repository = module.get(MikroOrmEventDistributionRepository);
    transaction = module.get(MikroOrmTransactionManager);
    em = module.get(EntityManager);
    eventId = EventId.random();
    mapping = new TraitTypeMapping(TRAITS.map((trait) => [new Trait(trait), new PersonalityType('explorer')] as const));
    curious = new TraitProfile([new Trait('curious')]);
  });

  // thinkTimeMs holds the transaction open between load and save, so concurrent calls really overlap.
  async function assignInTransaction(attendeeId: AttendeeId, thinkTimeMs = 0): Promise<void> {
    await transaction.run(async () => {
      const distribution = (await repository.searchForUpdate(eventId))!;
      await new Promise((resolve) => setTimeout(resolve, thinkTimeMs));
      distribution.assign(attendeeId, curious, mapping);
      await repository.save(distribution);
    });
  }

  it('testPersistsAndReloadsADistributionWithItsAssignments', async () => {
    await repository.save(EventDistribution.open(eventId));
    const first = AttendeeId.random();
    const second = AttendeeId.random();
    await assignInTransaction(first);
    await assignInTransaction(second);
    em.clear();

    const reloaded = await transaction.run(() => repository.searchForUpdate(eventId));

    expect(reloaded).toBeInstanceOf(EventDistribution);
    expect(reloaded?.toDTO().groups.map((group) => group.members)).toEqual([1, 1, 0, 0]);
    expect(reloaded?.assignments().map((assignment) => assignment.attendeeId.value)).toEqual([
      first.value,
      second.value,
    ]);
  });

  it('testReturnsNullForAnUnknownEvent', async () => {
    expect(await transaction.run(() => repository.searchForUpdate(eventId))).toBeNull();
  });

  it('testTellsWhetherADistributionExists', async () => {
    expect(await repository.exists(eventId)).toBe(false);

    await repository.save(EventDistribution.open(eventId));

    expect(await repository.exists(eventId)).toBe(true);
  });

  it('testViewListsAllFourColorsWithTheirMembers', async () => {
    await repository.save(EventDistribution.open(eventId));
    await assignInTransaction(AttendeeId.random());
    await assignInTransaction(AttendeeId.random());

    expect(await repository.byEvent(eventId)).toEqual({
      eventId: eventId.value,
      groups: [
        { color: 'amber', members: 1, personalityTypes: ['explorer'] },
        { color: 'coral', members: 1, personalityTypes: ['explorer'] },
        { color: 'teal', members: 0, personalityTypes: [] },
        { color: 'violet', members: 0, personalityTypes: [] },
      ],
    });
  });

  it('testViewExcludesOtherEvents', async () => {
    const otherEventId = EventId.random();
    await repository.save(EventDistribution.open(eventId));
    await repository.save(EventDistribution.open(otherEventId));
    await assignInTransaction(AttendeeId.random());

    const other = await repository.byEvent(otherEventId);

    expect(other?.groups.map((group) => group.members)).toEqual([0, 0, 0, 0]);
  });

  it('testViewOfAnUnknownEventIsNull', async () => {
    expect(await repository.byEvent(eventId)).toBeNull();
  });

  it('testReadsOneAttendeeAssignment', async () => {
    const attendeeId = AttendeeId.random();
    await repository.save(EventDistribution.open(eventId));
    await assignInTransaction(attendeeId);
    em.clear();

    const assignment = await repository.assignmentOf(eventId, attendeeId);

    expect(assignment?.toDTO()).toEqual({
      eventId: eventId.value,
      attendeeId: attendeeId.value,
      color: 'amber',
      personalityType: 'explorer',
    });
  });

  it('testAssignmentOfAnUnknownAttendeeOrEventIsNull', async () => {
    await repository.save(EventDistribution.open(eventId));

    expect(await repository.assignmentOf(eventId, AttendeeId.random())).toBeNull();
    expect(await repository.assignmentOf(EventId.random(), AttendeeId.random())).toBeNull();
  });

  it('testConcurrentAssignmentsInOneEventAreSerialized', async () => {
    await repository.save(EventDistribution.open(eventId));

    await Promise.all([assignInTransaction(AttendeeId.random(), 100), assignInTransaction(AttendeeId.random(), 100)]);

    const view = await repository.byEvent(eventId);
    expect(view?.groups.map((group) => group.members)).toEqual([1, 1, 0, 0]);
  });
});
