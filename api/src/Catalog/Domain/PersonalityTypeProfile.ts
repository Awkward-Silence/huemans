import { PersonalityType, PersonalityTypeValue } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { TraitValue } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { Blurb } from './ValueObject/Blurb';
import { Nickname } from './ValueObject/Nickname';
import { ProfileTraitCollection } from './ValueObject/ProfileTraitCollection';

export interface PersonalityTypeProfileDTO {
  type: PersonalityTypeValue;
  nickname: string;
  blurb: string;
  traits: TraitValue[];
}

/** Entity of PersonalityTypes: the reveal copy of one personality type, identified by that type. */
export class PersonalityTypeProfile {
  constructor(
    readonly type: PersonalityType,
    readonly nickname: Nickname,
    readonly blurb: Blurb,
    readonly traits: ProfileTraitCollection,
  ) {}

  toDTO(): PersonalityTypeProfileDTO {
    return {
      type: this.type.value,
      nickname: this.nickname.value,
      blurb: this.blurb.value,
      traits: this.traits.all().map((trait) => trait.value),
    };
  }
}
