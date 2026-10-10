import { PersonalityTypeProfile } from '@Huemans/Catalog/Domain/PersonalityTypeProfile';
import { Blurb } from '@Huemans/Catalog/Domain/ValueObject/Blurb';
import { Nickname } from '@Huemans/Catalog/Domain/ValueObject/Nickname';
import { PersonalityTypeProfileCollection } from '@Huemans/Catalog/Domain/ValueObject/PersonalityTypeProfileCollection';
import { ProfileTraitCollection } from '@Huemans/Catalog/Domain/ValueObject/ProfileTraitCollection';
import { TraitType } from '@Huemans/Catalog/Domain/ValueObject/TraitType';
import { TraitTypeMapping } from '@Huemans/Catalog/Domain/ValueObject/TraitTypeMapping';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { PERSONALITY_TYPES, PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { Trait, TRAITS } from '@Huemans/Shared/Domain/ValueObject/Trait';

describe('PersonalityTypes parts', () => {
  let traitTypes: TraitType[];
  let profiles: PersonalityTypeProfile[];

  beforeEach(() => {
    traitTypes = TRAITS.map((trait) => new TraitType(new Trait(trait), new PersonalityType('planner')));
    profiles = PERSONALITY_TYPES.map(
      (type) =>
        new PersonalityTypeProfile(
          new PersonalityType(type),
          new Nickname(`The ${type}s`),
          new Blurb(`About the ${type}s`),
          new ProfileTraitCollection(TRAITS.slice(0, 3).map((trait) => new Trait(trait))),
        ),
    );
  });

  it('testMappingAcceptsEveryTraitOnce', () => {
    expect(new TraitTypeMapping(traitTypes).count()).toBe(33);
  });

  it('testMappingRejectsAMissingTrait', () => {
    expect(() => new TraitTypeMapping(traitTypes.slice(1))).toThrow(InvalidArgumentError);
  });

  it('testMappingRejectsARepeatedTrait', () => {
    expect(() => new TraitTypeMapping([...traitTypes, traitTypes[0]])).toThrow(InvalidArgumentError);
  });

  it('testProfilesAcceptOnePerType', () => {
    expect(new PersonalityTypeProfileCollection(profiles).count()).toBe(4);
  });

  it('testProfilesRejectAMissingType', () => {
    expect(() => new PersonalityTypeProfileCollection(profiles.slice(1))).toThrow(/explorer/);
  });

  it('testProfilesRejectADuplicatedType', () => {
    expect(() => new PersonalityTypeProfileCollection([...profiles.slice(0, 3), profiles[0]])).toThrow(
      InvalidArgumentError,
    );
  });
});
