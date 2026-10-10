import { PERSONALITY_TYPE_PROFILES, PERSONALITY_TYPES } from '@Huemans/Types/PersonalityType';
import { TRAITS } from '@Huemans/Types/Trait';
import { TRAIT_TYPES } from '@Huemans/Types/TraitTypeMapping';

describe('TRAIT_TYPES', () => {
  it('testMapsEveryTraitToAPersonalityType', () => {
    expect(Object.keys(TRAIT_TYPES).sort()).toEqual([...TRAITS].sort());
    for (const trait of TRAITS) {
      expect(PERSONALITY_TYPES).toContain(TRAIT_TYPES[trait]);
    }
  });

  it('testEveryPersonalityTypeHasATrait', () => {
    expect([...new Set(Object.values(TRAIT_TYPES))].sort()).toEqual([...PERSONALITY_TYPES].sort());
  });

  it('testRevealChipsBelongToTheirType', () => {
    for (const type of PERSONALITY_TYPES) {
      for (const trait of PERSONALITY_TYPE_PROFILES[type].traits) {
        expect({ trait, type: TRAIT_TYPES[trait] }).toEqual({ trait, type });
      }
    }
  });
});
