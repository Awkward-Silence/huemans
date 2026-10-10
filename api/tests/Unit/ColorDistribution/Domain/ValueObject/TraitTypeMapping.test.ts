import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { TraitTypeMapping } from '@Huemans/ColorDistribution/Domain/ValueObject/TraitTypeMapping';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { Trait, TRAITS } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { mappingWith } from '../TraitTypeMappingMother';

describe('TraitTypeMapping', () => {
  let explorer: PersonalityType;
  let pairs: (readonly [Trait, PersonalityType])[];

  beforeEach(() => {
    explorer = new PersonalityType('explorer');
    pairs = TRAITS.map((trait) => [new Trait(trait), explorer] as const);
  });

  it('testMapsEachTraitToItsType', () => {
    const mapping = mappingWith({ curious: 'explorer', sociable: 'connector' });

    expect(mapping.typeOf(new Trait('curious')).value).toBe('explorer');
    expect(mapping.typeOf(new Trait('sociable')).value).toBe('connector');
  });

  it('testRejectsAMissingTrait', () => {
    expect(() => new TraitTypeMapping(pairs.slice(1))).toThrow(InvalidArgumentError);
  });

  it('testRejectsADoublyMappedTrait', () => {
    expect(() => new TraitTypeMapping([...pairs, [new Trait('curious'), new PersonalityType('planner')]])).toThrow(
      InvalidArgumentError,
    );
  });
});
