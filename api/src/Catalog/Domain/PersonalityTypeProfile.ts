import { PersonalityType, PersonalityTypeValue } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { TraitValue } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { ProfileTraitCollection } from './ValueObject/ProfileTraitCollection';

export interface PersonalityTypeProfileDTO {
  type: PersonalityTypeValue;
  nickname: string;
  blurb: string;
  traits: TraitValue[];
}

/** Read model: the reveal copy of one personality type. */
export class PersonalityTypeProfile {
  constructor(
    readonly type: PersonalityType,
    readonly nickname: string,
    readonly blurb: string,
    readonly traits: ProfileTraitCollection,
  ) {}

  toDTO(): PersonalityTypeProfileDTO {
    return {
      type: this.type.value,
      nickname: this.nickname,
      blurb: this.blurb,
      traits: this.traits.all().map((trait) => trait.value),
    };
  }
}
