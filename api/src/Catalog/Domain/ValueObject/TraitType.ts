import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';

/** One trait and the personality type it is mapped to. */
export class TraitType {
  constructor(
    readonly trait: Trait,
    readonly type: PersonalityType,
  ) {}
}
