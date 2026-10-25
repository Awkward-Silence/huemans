import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { StringValueObject } from '@Huemans/Shared/Domain/ValueObject/StringValueObject';

export class AttendeeName extends StringValueObject {
  static readonly MAX_LENGTH = 40;

  constructor(value: string) {
    if (typeof value !== 'string') {
      throw new InvalidArgumentError('<AttendeeName> must be text');
    }
    super(value.trim());
    if (this.value.length === 0 || this.value.length > AttendeeName.MAX_LENGTH) {
      throw new InvalidArgumentError(`<AttendeeName> must have 1 to ${AttendeeName.MAX_LENGTH} characters`);
    }
  }
}
