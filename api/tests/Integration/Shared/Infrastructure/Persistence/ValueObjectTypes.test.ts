import { EntityManager, EntitySchema, MikroORM } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { AggregateRoot } from '@Huemans/Shared/Domain/AggregateRoot';
import { EnumValueObject } from '@Huemans/Shared/Domain/ValueObject/EnumValueObject';
import { NumberValueObject } from '@Huemans/Shared/Domain/ValueObject/NumberValueObject';
import { StringValueObject } from '@Huemans/Shared/Domain/ValueObject/StringValueObject';
import { Uuid } from '@Huemans/Shared/Domain/ValueObject/Uuid';
import { MikroOrmRepository } from '@Huemans/Shared/Infrastructure/Persistence/MikroOrm/MikroOrmRepository';
import { VO } from '@Huemans/Shared/Infrastructure/Persistence/MikroOrm/Types/ValueObjectTypeFactory';
import { bootIntegration, clearDatabase } from '../../../../Support/integration';

class BadgeId extends Uuid {}
class BadgeLabel extends StringValueObject {}
class BadgePoints extends NumberValueObject {}
class BadgeTier extends EnumValueObject<'bronze' | 'gold'> {
  constructor(value: string) {
    super(value, ['bronze', 'gold']);
  }
}

class Badge extends AggregateRoot {
  constructor(
    readonly id: BadgeId,
    readonly label: BadgeLabel,
    readonly points: BadgePoints,
    readonly tier: BadgeTier,
  ) {
    super();
  }

  toDTO(): object {
    return { id: this.id.value };
  }
}

const BadgeSchema = new EntitySchema<Badge>({
  class: Badge,
  tableName: 'test_badges',
  properties: {
    id: { type: VO.uuid(BadgeId), primary: true },
    label: { type: VO.string(BadgeLabel) },
    points: { type: VO.number(BadgePoints) },
    tier: { type: VO.enum(BadgeTier) },
  },
});

@Injectable()
class MikroOrmBadgeRepository extends MikroOrmRepository<Badge> {
  constructor(em: EntityManager) {
    super(em);
  }

  protected entitySchema(): EntitySchema<Badge> {
    return BadgeSchema;
  }

  async search(id: BadgeId): Promise<Badge | null> {
    return this.repository().findOne({ id });
  }
}

describe('MikroORM value object types', () => {
  let module: TestingModule;
  let repository: MikroOrmBadgeRepository;
  let em: EntityManager;

  beforeAll(async () => {
    module = await bootIntegration({ entities: [BadgeSchema], providers: [MikroOrmBadgeRepository] });
    // safe: only create test_badges; never drop the migrated tables it does not know about.
    await module.get(MikroORM).schema.updateSchema({ safe: true });
  });

  afterAll(async () => {
    await module.get(MikroORM).schema.execute('DROP TABLE IF EXISTS test_badges');
    await module.close();
  });

  beforeEach(async () => {
    await clearDatabase(module);
    repository = module.get(MikroOrmBadgeRepository);
    em = module.get(EntityManager);
  });

  it('testRoundTripsValueObjects', async () => {
    const badge = new Badge(BadgeId.random(), new BadgeLabel('Icebreaker'), new BadgePoints(42), new BadgeTier('gold'));

    await repository.save(badge);
    em.clear();
    const found = await repository.search(badge.id);

    expect(found).toBeInstanceOf(Badge);
    expect(found?.id.equals(badge.id)).toBe(true);
    expect(found?.label.equals(badge.label)).toBe(true);
    expect(found?.points.equals(badge.points)).toBe(true);
    expect(found?.tier.equals(badge.tier)).toBe(true);
  });

  it('testReturnsNullWhenMissing', async () => {
    expect(await repository.search(BadgeId.random())).toBeNull();
  });
});
