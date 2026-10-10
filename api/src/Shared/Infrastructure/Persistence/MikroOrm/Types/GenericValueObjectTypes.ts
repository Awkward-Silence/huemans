import { Type } from '@mikro-orm/core';
import { EnumValueObject } from '../../../../Domain/ValueObject/EnumValueObject';
import { NumberValueObject } from '../../../../Domain/ValueObject/NumberValueObject';
import { StringValueObject } from '../../../../Domain/ValueObject/StringValueObject';
import { Uuid } from '../../../../Domain/ValueObject/Uuid';

abstract class ValueObjectType<T extends { value: P }, P> extends Type<T | null, P | null> {
  constructor(private readonly voClass: new (value: P) => T) {
    super();
  }

  convertToDatabaseValue(valueObject: T | null | undefined): P | null {
    return valueObject?.value ?? null;
  }

  convertToJSValue(primitive: P | null | undefined): T | null {
    return primitive === null || primitive === undefined ? null : new this.voClass(primitive);
  }
}

export class UuidValueObjectType<T extends Uuid> extends ValueObjectType<T, string> {
  getColumnType(): string {
    return 'uuid';
  }
}

export class StringValueObjectType<T extends StringValueObject> extends ValueObjectType<T, string> {
  getColumnType(): string {
    return 'text';
  }
}

export class NumberValueObjectType<T extends NumberValueObject> extends ValueObjectType<T, number> {
  getColumnType(): string {
    return 'integer';
  }
}

export class EnumValueObjectType<T extends EnumValueObject<string>> extends ValueObjectType<T, string> {
  getColumnType(): string {
    return 'text';
  }
}
