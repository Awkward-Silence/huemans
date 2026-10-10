import { InvalidArgumentError } from '../InvalidArgumentError';

export type Primitives = string | number | boolean | Date;

export abstract class ValueObject<T extends Primitives> {
  readonly value: T;

  protected constructor(value: T) {
    if (value === null || value === undefined) {
      throw new InvalidArgumentError(`<${new.target.name}> requires a value`);
    }
    this.value = value;
  }

  equals(other: ValueObject<T>): boolean {
    return other.constructor === this.constructor && other.value === this.value;
  }

  toString(): string {
    return this.value.toString();
  }
}
