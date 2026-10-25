import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { StringValueObject } from '@Huemans/Shared/Domain/ValueObject/StringValueObject';

/** The catalog key of the picked icebreaker (e.g. `i0001`). */
export class IcebreakerId extends StringValueObject {
  constructor(value: string) {
    super(value);
    if (value.trim() === '') {
      throw new InvalidArgumentError('<IcebreakerId> must not be empty');
    }
  }
}
