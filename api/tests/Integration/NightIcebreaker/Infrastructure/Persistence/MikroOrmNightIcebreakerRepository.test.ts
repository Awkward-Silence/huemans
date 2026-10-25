import { EntityManager } from '@mikro-orm/postgresql';
import { TestingModule } from '@nestjs/testing';
import { NightIcebreaker } from '@Huemans/NightIcebreaker/Domain/NightIcebreaker';
import { IcebreakerCandidate } from '@Huemans/NightIcebreaker/Domain/ValueObject/IcebreakerCandidate';
import { IcebreakerReason } from '@Huemans/NightIcebreaker/Domain/ValueObject/IcebreakerReason';
import { MikroOrmNightIcebreakerRepository } from '@Huemans/NightIcebreaker/Infrastructure/Persistence/MikroOrm/MikroOrmNightIcebreakerRepository';
import { NightIcebreakerSchema } from '@Huemans/NightIcebreaker/Infrastructure/Persistence/MikroOrm/NightIcebreakerSchema';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { bootIntegration } from '../../../../Support/integration';

describe('MikroOrmNightIcebreakerRepository', () => {
  let module: TestingModule;
  let repository: MikroOrmNightIcebreakerRepository;
  let em: EntityManager;
  let eventId: EventId;

  beforeAll(async () => {
    module = await bootIntegration({
      entities: [NightIcebreakerSchema],
      providers: [MikroOrmNightIcebreakerRepository],
    });
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(() => {
    repository = module.get(MikroOrmNightIcebreakerRepository);
    em = module.get(EntityManager);
    eventId = EventId.random();
  });

  it('testSavesAndFindsThePickedIcebreaker', async () => {
    const picked = NightIcebreaker.pick(
      eventId,
      IcebreakerCandidate.fromPrimitives({ id: 'i0007', text: 'Which song?', traits: ['creative'] }),
      new IcebreakerReason('Picked for a room that leans creative.'),
      new Date('2026-10-25T21:00:00.000Z'),
    );

    await repository.save(picked);
    em.clear();

    expect((await repository.search(eventId))?.toDTO()).toEqual(picked.toDTO());
  });

  it('testNothingBeforeThePick', async () => {
    expect(await repository.search(eventId)).toBeNull();
  });
});
