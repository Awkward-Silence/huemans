import { InvalidArgumentError } from '../InvalidArgumentError';
import { ValueObject } from './ValueObject';

export abstract class EnumValueObject<T extends string> extends ValueObject<T> {
  protected constructor(value: string, validValues: readonly T[]) {
    if (!validValues.includes(value as T)) {
      throw new InvalidArgumentError(`<${new.target.name}> does not allow the value <${value}>`);
    }
    super(value as T);
  }
}
