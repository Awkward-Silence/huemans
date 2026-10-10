import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';

// Not a NotFoundError: every type has a profile once seeded, so a missing one is a deploy fault (500), not a 404.
export class PersonalityTypeProfileNotFound extends Error {
  constructor(type: PersonalityType) {
    super(`The catalog has no profile for <${type.value}>; run the catalog seed`);
    this.name = new.target.name;
  }
}
