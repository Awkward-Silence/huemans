import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { NumberValueObject } from '@Huemans/Shared/Domain/ValueObject/NumberValueObject';

export class AttendeeCount extends NumberValueObject {
  constructor(value: number) {
    if (!Number.isInteger(value) || value < 0) {
      throw new InvalidArgumentError(`<AttendeeCount> does not allow the value <${value}>`);
    }
    super(value);
  }
}
