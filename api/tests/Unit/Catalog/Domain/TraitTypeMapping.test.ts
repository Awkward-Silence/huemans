import { TraitTypeMapping } from '@Huemans/Catalog/Domain/TraitTypeMapping';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { Trait, TRAITS } from '@Huemans/Shared/Domain/ValueObject/Trait';

const planner = new PersonalityType('planner');
const pairsFor = (traits: readonly string[]) => traits.map((trait) => [new Trait(trait), planner] as const);

describe('Catalog TraitTypeMapping', () => {
  it('testAcceptsEveryTraitExactlyOnce', () => {
    expect(new TraitTypeMapping(pairsFor(TRAITS)).pairs).toHaveLength(33);
  });

  it('testRejectsAMissingTrait', () => {
    expect(() => new TraitTypeMapping(pairsFor(TRAITS.filter((trait) => trait !== 'honest')))).toThrow(
      /missing: honest/,
    );
  });

  it('testRejectsARepeatedTrait', () => {
    expect(() => new TraitTypeMapping(pairsFor([...TRAITS, 'honest']))).toThrow(InvalidArgumentError);
  });
});
