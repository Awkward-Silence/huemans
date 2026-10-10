import { TraitTypeMapping } from '@Huemans/ColorDistribution/Domain/ValueObject/TraitTypeMapping';
import { ProvisionalTraitTypeMappingProvider } from '@Huemans/ColorDistribution/Infrastructure/Catalog/ProvisionalTraitTypeMappingProvider';
import { Trait, TRAITS } from '@Huemans/Shared/Domain/ValueObject/Trait';

describe('ProvisionalTraitTypeMappingProvider', () => {
  let mapping: TraitTypeMapping;

  beforeEach(async () => {
    mapping = await new ProvisionalTraitTypeMappingProvider().mapping();
  });

  it('testBuildsAValidMappingOfAllTraits', () => {
    expect(mapping).toBeInstanceOf(TraitTypeMapping);
  });

  it('testUsesEveryPersonalityType', () => {
    const types = new Set(TRAITS.map((trait) => mapping.typeOf(new Trait(trait)).value));

    expect([...types].sort()).toEqual(['connector', 'dreamer', 'explorer', 'planner']);
  });
});
