import { EnumValueObject } from './EnumValueObject';
import { TRAITS, type TraitValue } from '@Huemans/Types/Trait';

export { TRAITS };
export type { TraitValue };

export class Trait extends EnumValueObject<TraitValue> {
  constructor(value: string) {
    super(value, TRAITS);
  }
}
