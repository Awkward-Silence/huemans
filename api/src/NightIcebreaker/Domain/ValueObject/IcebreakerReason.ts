import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { StringValueObject } from '@Huemans/Shared/Domain/ValueObject/StringValueObject';

/** One sentence on why the room got this icebreaker. */
export class IcebreakerReason extends StringValueObject {
  constructor(value: string) {
    super(value);
    if (value.trim() === '') {
      throw new InvalidArgumentError('<IcebreakerReason> must not be empty');
    }
  }
}
