import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { StringValueObject } from '@Huemans/Shared/Domain/ValueObject/StringValueObject';

/** The icebreaker's text, copied from the catalog when it is picked. */
export class IcebreakerQuestion extends StringValueObject {
  constructor(value: string) {
    super(value);
    if (value.trim() === '') {
      throw new InvalidArgumentError('<IcebreakerQuestion> must not be empty');
    }
  }
}
