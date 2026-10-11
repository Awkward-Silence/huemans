import { TraitProfile } from '@Huemans/ColorDistribution/Domain/ValueObject/TraitProfile';
import { TraitTypeMapping } from '@Huemans/ColorDistribution/Domain/ValueObject/TraitTypeMapping';
import { Trait, TraitValue } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { TraitWeight } from '@Huemans/Shared/Domain/ValueObject/TraitWeight';
import { WeightedTrait } from '@Huemans/Shared/Domain/ValueObject/WeightedTrait';
import { mappingWith } from '../TraitTypeMappingMother';

function profile(...traits: [TraitValue, number][]): TraitProfile {
  return new TraitProfile(
    traits.map(([trait, weight]) => new WeightedTrait(new Trait(trait), new TraitWeight(weight))),
  );
}

function typesOf(traitProfile: TraitProfile, mapping: TraitTypeMapping): string[] {
  return traitProfile.candidateTypes(mapping).map((type) => type.value);
}

describe('TraitProfile', () => {
  let mapping: TraitTypeMapping;

  beforeEach(() => {
    mapping = mappingWith({ curious: 'explorer', sociable: 'connector', organized: 'planner', romantic: 'dreamer' });
  });

  it('testKeepsRepeatedTraits', () => {
    expect(profile(['curious', 1], ['curious', 1], ['sociable', 1]).count()).toBe(3);
  });

  it('testHighestSummedWeightDecidesTheType', () => {
    expect(typesOf(profile(['curious', 1], ['sociable', 0.6], ['sociable', 0.6]), mapping)).toEqual(['connector']);
  });

  it('testAFractionalWeightBreaksATie', () => {
    expect(typesOf(profile(['curious', 1], ['organized', 1], ['organized', 0.2], ['curious', 0.1]), mapping)).toEqual([
      'planner',
    ]);
  });

  it('testSumsThatDifferOnlyByFloatRoundingTie', () => {
    expect(typesOf(profile(['curious', 0.1], ['curious', 0.2], ['organized', 0.3]), mapping)).toEqual([
      'explorer',
      'planner',
    ]);
  });

  it('testEmptyProfileTiesAllFourTypes', () => {
    expect(typesOf(new TraitProfile([]), mapping)).toEqual(['explorer', 'connector', 'planner', 'dreamer']);
  });
});
