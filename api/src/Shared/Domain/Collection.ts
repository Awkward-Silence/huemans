import { InvalidArgumentError } from './InvalidArgumentError';

export abstract class Collection<T> implements Iterable<T> {
  private readonly items: readonly T[];

  constructor(items: readonly T[]) {
    const type = this.type();
    for (const item of items) {
      if (!(item instanceof type)) {
        throw new InvalidArgumentError(`<${new.target.name}> only accepts <${type.name}> items`);
      }
    }
    this.items = [...items];
  }

  protected abstract type(): abstract new (...args: never[]) => T;

  count(): number {
    return this.items.length;
  }

  all(): readonly T[] {
    return [...this.items];
  }

  [Symbol.iterator](): Iterator<T> {
    return this.items[Symbol.iterator]();
  }
}
