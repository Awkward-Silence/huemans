import { v7, validate, version } from 'uuid';
import { InvalidArgumentError } from '../InvalidArgumentError';
import { StringValueObject } from './StringValueObject';

export class Uuid extends StringValueObject {
  constructor(value: string) {
    if (!validate(value) || version(value) !== 7) {
      throw new InvalidArgumentError(`<${new.target.name}> does not allow the value <${value}>`);
    }
    super(value);
  }

  static random<T extends Uuid>(this: new (value: string) => T): T {
    return new this(v7());
  }
}
