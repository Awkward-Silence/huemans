import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { StringValueObject } from '@Huemans/Shared/Domain/ValueObject/StringValueObject';

export class EventName extends StringValueObject {
  static readonly MAX_LENGTH = 255;

  constructor(value: string) {
    if (typeof value !== 'string') {
      throw new InvalidArgumentError('<EventName> must be text');
    }
    super(value.trim());
    if (this.value.length === 0 || this.value.length > EventName.MAX_LENGTH) {
      throw new InvalidArgumentError(`<EventName> must have 1 to ${EventName.MAX_LENGTH} characters`);
    }
  }
}
