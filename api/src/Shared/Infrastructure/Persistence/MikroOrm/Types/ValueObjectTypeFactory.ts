import { EnumValueObject } from '../../../../Domain/ValueObject/EnumValueObject';
import { NumberValueObject } from '../../../../Domain/ValueObject/NumberValueObject';
import { StringValueObject } from '../../../../Domain/ValueObject/StringValueObject';
import { Uuid } from '../../../../Domain/ValueObject/Uuid';
import {
  EnumValueObjectType,
  NumberValueObjectType,
  StringValueObjectType,
  UuidValueObjectType,
} from './GenericValueObjectTypes';

export const VO = {
  uuid: <T extends Uuid>(voClass: new (value: string) => T) => new UuidValueObjectType<T>(voClass),
  string: <T extends StringValueObject>(voClass: new (value: string) => T) => new StringValueObjectType<T>(voClass),
  number: <T extends NumberValueObject>(voClass: new (value: number) => T) => new NumberValueObjectType<T>(voClass),
  enum: <T extends EnumValueObject<string>>(voClass: new (value: string) => T) => new EnumValueObjectType<T>(voClass),
};
