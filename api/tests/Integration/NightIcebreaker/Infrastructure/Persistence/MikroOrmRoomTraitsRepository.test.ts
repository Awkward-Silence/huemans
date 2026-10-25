import { TestingModule } from '@nestjs/testing';
import { MikroOrmRoomTraitsRepository } from '@Huemans/NightIcebreaker/Infrastructure/Persistence/MikroOrm/MikroOrmRoomTraitsRepository';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { WeightedTrait } from '@Huemans/Shared/Domain/ValueObject/WeightedTrait';
import { bootIntegration } from '../../../../Support/integration';
import { wholeAnswers } from '../../../../Support/traits';

describe('MikroOrmRoomTraitsRepository', () => {
  let module: TestingModule;
  let repository: MikroOrmRoomTraitsRepository;
  let eventId: EventId;
  let curious: Trait;

  beforeAll(async () => {
    module = await bootIntegration({ providers: [MikroOrmRoomTraitsRepository] });
  });

  afterAll(async () => {
    await module.close();
  });

  // No truncation: every test uses a fresh event id, and functional suites share this table in parallel.
  beforeEach(() => {
    repository = module.get(MikroOrmRoomTraitsRepository);
    eventId = EventId.random();
    curious = new Trait('curious');
  });

  it('testProfileSumsEveryAttendeeOfTheEvent', async () => {
    await repository.add(eventId, AttendeeId.random(), traits(...wholeAnswers('curious', 'analytical')));
    await repository.add(eventId, AttendeeId.random(), traits({ trait: 'curious', weight: 0.5 }));

    const profile = await repository.profileOf(eventId);

    expect(profile.weightOf(curious)).toBe(1.5);
    expect(profile.weightOf(new Trait('analytical'))).toBe(1);
  });

  it('testAddingTheSameAttendeeTwiceCountsOnce', async () => {
    const attendee = AttendeeId.random();

    await repository.add(eventId, attendee, traits(...wholeAnswers('curious')));
    await repository.add(eventId, attendee, traits(...wholeAnswers('curious')));

    expect((await repository.profileOf(eventId)).weightOf(curious)).toBe(1);
  });

  it('testProfileSumsOnlyThatEvent', async () => {
    await repository.add(EventId.random(), AttendeeId.random(), traits(...wholeAnswers('curious')));

    expect((await repository.profileOf(eventId)).weightOf(curious)).toBe(0);
  });

  it('testAnAttendeeWithNoTraitsIsKept', async () => {
    await repository.add(eventId, AttendeeId.random(), []);

    expect((await repository.profileOf(eventId)).weightOf(curious)).toBe(0);
  });
});

function traits(...primitives: { trait: string; weight: number }[]): WeightedTrait[] {
  return primitives.map((trait) => WeightedTrait.fromPrimitives(trait));
}
