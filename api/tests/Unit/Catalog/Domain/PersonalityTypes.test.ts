import { PersonalityTypesDefined } from '@Huemans/Catalog/Domain/Event/PersonalityTypesDefined';
import { PersonalityTypeProfile } from '@Huemans/Catalog/Domain/PersonalityTypeProfile';
import { PersonalityTypes } from '@Huemans/Catalog/Domain/PersonalityTypes';
import { Blurb } from '@Huemans/Catalog/Domain/ValueObject/Blurb';
import { Nickname } from '@Huemans/Catalog/Domain/ValueObject/Nickname';
import { PersonalityTypeProfileCollection } from '@Huemans/Catalog/Domain/ValueObject/PersonalityTypeProfileCollection';
import { ProfileTraitCollection } from '@Huemans/Catalog/Domain/ValueObject/ProfileTraitCollection';
import { TraitType } from '@Huemans/Catalog/Domain/ValueObject/TraitType';
import { TraitTypeMapping } from '@Huemans/Catalog/Domain/ValueObject/TraitTypeMapping';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import {
  PERSONALITY_TYPES,
  PersonalityType,
  PersonalityTypeValue,
} from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { Trait, TRAITS, TraitValue } from '@Huemans/Shared/Domain/ValueObject/Trait';

describe('PersonalityTypes', () => {
  let typeOf: Record<TraitValue, PersonalityTypeValue>;
  let mapping: TraitTypeMapping;
  let chipsOf: (type: PersonalityTypeValue) => TraitValue[];
  let profilesWith: (chips: (type: PersonalityTypeValue) => TraitValue[]) => PersonalityTypeProfileCollection;

  beforeEach(() => {
    typeOf = Object.fromEntries(
      TRAITS.map((trait, index) => [trait, PERSONALITY_TYPES[index % PERSONALITY_TYPES.length]]),
    ) as Record<TraitValue, PersonalityTypeValue>;
    mapping = new TraitTypeMapping(
      TRAITS.map((trait) => new TraitType(new Trait(trait), new PersonalityType(typeOf[trait]))),
    );
    chipsOf = (type) => TRAITS.filter((trait) => typeOf[trait] === type).slice(0, 3);
    profilesWith = (chips) =>
      new PersonalityTypeProfileCollection(
        PERSONALITY_TYPES.map(
          (type) =>
            new PersonalityTypeProfile(
              new PersonalityType(type),
              new Nickname(`The ${type}s`),
              new Blurb(`About the ${type}s`),
              new ProfileTraitCollection(chips(type).map((trait) => new Trait(trait))),
            ),
        ),
      );
  });

  it('testDefiningRecordsPersonalityTypesDefined', () => {
    const personalityTypes = PersonalityTypes.define(mapping, profilesWith(chipsOf));

    const events = personalityTypes.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(PersonalityTypesDefined);
  });

  it('testRejectsAChipMappedToAnotherType', () => {
    const explorerTrait = TRAITS.find((trait) => typeOf[trait] === 'explorer')!;
    const plannerWithExplorerChip = (type: PersonalityTypeValue) =>
      type === 'planner' ? [explorerTrait, ...chipsOf('planner').slice(1)] : chipsOf(type);

    expect(() => PersonalityTypes.define(mapping, profilesWith(plannerWithExplorerChip))).toThrow(InvalidArgumentError);
    expect(() => PersonalityTypes.define(mapping, profilesWith(plannerWithExplorerChip))).toThrow(
      `planner chip ${explorerTrait} is mapped to explorer`,
    );
  });

  it('testRebuildingRecordsNothing', () => {
    expect(PersonalityTypes.rebuild(mapping, profilesWith(chipsOf)).pullDomainEvents()).toEqual([]);
  });

  it('testReadsTheProfileOfAType', () => {
    const personalityTypes = PersonalityTypes.rebuild(mapping, profilesWith(chipsOf));

    expect(personalityTypes.profileOf(new PersonalityType('dreamer'))).toEqual({
      type: 'dreamer',
      nickname: 'The dreamers',
      blurb: 'About the dreamers',
      traits: chipsOf('dreamer'),
    });
  });

  it('testToDTOCarriesTheMappingAndTheProfiles', () => {
    const dto = PersonalityTypes.rebuild(mapping, profilesWith(chipsOf)).toDTO();

    expect(dto.mapping).toEqual(typeOf);
    expect(dto.profiles.map((profile) => profile.type)).toEqual([...PERSONALITY_TYPES]);
  });
});
