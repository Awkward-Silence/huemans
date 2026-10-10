import { AggregateRoot } from '@Huemans/Shared/Domain/AggregateRoot';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { PersonalityType, PersonalityTypeValue } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { TraitValue } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { PersonalityTypesDefined } from './Event/PersonalityTypesDefined';
import { PersonalityTypeProfileDTO } from './PersonalityTypeProfile';
import { PersonalityTypeProfileCollection } from './ValueObject/PersonalityTypeProfileCollection';
import { TraitTypeMapping } from './ValueObject/TraitTypeMapping';

export type TraitTypeMappingDTO = Record<TraitValue, PersonalityTypeValue>;

export interface PersonalityTypesDTO {
  mapping: TraitTypeMappingDTO;
  profiles: PersonalityTypeProfileDTO[];
}

/**
 * The trait-type mapping and the 4 profiles, defined together because one rule spans both: each profile's trait
 * chips are mapped to the profile's own type. A single instance per catalog.
 */
export class PersonalityTypes extends AggregateRoot {
  private constructor(
    readonly mapping: TraitTypeMapping,
    readonly profiles: PersonalityTypeProfileCollection,
  ) {
    super();
  }

  static define(mapping: TraitTypeMapping, profiles: PersonalityTypeProfileCollection): PersonalityTypes {
    const misplaced = profiles.all().flatMap((profile) =>
      profile.traits
        .all()
        .filter((trait) => !mapping.typeOf(trait).equals(profile.type))
        .map((trait) => `${profile.type.value} chip ${trait.value} is mapped to ${mapping.typeOf(trait).value}`),
    );
    if (misplaced.length > 0) {
      throw new InvalidArgumentError(`<PersonalityTypes> ${misplaced.join('; ')}`);
    }
    const personalityTypes = new PersonalityTypes(mapping, profiles);
    personalityTypes.record(new PersonalityTypesDefined());
    return personalityTypes;
  }

  /** The stored personality types, read back: nothing happened, so nothing is recorded. */
  static rebuild(mapping: TraitTypeMapping, profiles: PersonalityTypeProfileCollection): PersonalityTypes {
    return new PersonalityTypes(mapping, profiles);
  }

  profileOf(type: PersonalityType): PersonalityTypeProfileDTO {
    // PersonalityTypeProfileCollection holds exactly one profile per type.
    return this.profiles
      .all()
      .find((profile) => profile.type.equals(type))!
      .toDTO();
  }

  toDTO(): PersonalityTypesDTO {
    return {
      mapping: Object.fromEntries(
        this.mapping.all().map(({ trait, type }) => [trait.value, type.value]),
      ) as TraitTypeMappingDTO,
      profiles: this.profiles.all().map((profile) => profile.toDTO()),
    };
  }
}
