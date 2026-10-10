import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { StringValueObject } from '@Huemans/Shared/Domain/ValueObject/StringValueObject';

/** Authored copy shown on a phone: not empty and within the length its place on screen allows. */
export abstract class CatalogText extends StringValueObject {
  protected constructor(value: string, maxLength: number) {
    super(value);
    if (value === '') {
      throw new InvalidArgumentError(`<${new.target.name}> must not be empty`);
    }
    if (value.length > maxLength) {
      throw new InvalidArgumentError(
        `<${new.target.name}> must be at most ${maxLength} characters, got ${value.length}`,
      );
    }
  }
}
