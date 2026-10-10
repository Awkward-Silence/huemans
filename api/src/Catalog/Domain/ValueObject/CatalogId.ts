import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { StringValueObject } from '@Huemans/Shared/Domain/ValueObject/StringValueObject';

/** A catalog key as authored in the content files (e.g. `q0001`, `q0001-a`, `i0001`): any non-empty string. */
export abstract class CatalogId extends StringValueObject {
  constructor(value: string) {
    super(value);
    if (value.trim() === '') {
      throw new InvalidArgumentError(`<${new.target.name}> must not be empty`);
    }
  }
}
