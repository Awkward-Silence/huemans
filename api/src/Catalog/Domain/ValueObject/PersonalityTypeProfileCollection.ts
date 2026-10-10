import { Collection } from '@Huemans/Shared/Domain/Collection';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { PERSONALITY_TYPES } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { PersonalityTypeProfile } from '../PersonalityTypeProfile';

/** Exactly one profile per personality type. */
export class PersonalityTypeProfileCollection extends Collection<PersonalityTypeProfile> {
  constructor(profiles: readonly PersonalityTypeProfile[]) {
    super(profiles);
    for (const type of PERSONALITY_TYPES) {
      const count = profiles.filter((profile) => profile.type.value === type).length;
      if (count !== 1) {
        throw new InvalidArgumentError(
          `<PersonalityTypeProfileCollection> needs exactly one profile for <${type}>, got ${count}`,
        );
      }
    }
  }

  protected type(): typeof PersonalityTypeProfile {
    return PersonalityTypeProfile;
  }
}
