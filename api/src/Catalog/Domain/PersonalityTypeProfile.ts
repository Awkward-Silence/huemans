import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { ProfileTraitCollection } from './ValueObject/ProfileTraitCollection';

/** Read model: the reveal copy of one personality type. */
export class PersonalityTypeProfile {
  constructor(
    readonly type: PersonalityType,
    readonly nickname: string,
    readonly blurb: string,
    readonly traits: ProfileTraitCollection,
  ) {}
}
