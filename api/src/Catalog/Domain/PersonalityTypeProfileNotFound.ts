import { NotFoundError } from '@Huemans/Shared/Domain/NotFoundError';
import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';

export class PersonalityTypeProfileNotFound extends NotFoundError {
  constructor(type: PersonalityType) {
    super(`The catalog has no profile for <${type.value}>; run the catalog seed`);
  }
}
