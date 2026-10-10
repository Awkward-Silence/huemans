import { EnumValueObject } from '@Huemans/Shared/Domain/ValueObject/EnumValueObject';
import { PERSONALITY_TYPES, type PersonalityTypeValue } from '@Huemans/Types/PersonalityType';

export { PERSONALITY_TYPES };
export type { PersonalityTypeValue };

export class PersonalityType extends EnumValueObject<PersonalityTypeValue> {
  constructor(value: string) {
    super(value, PERSONALITY_TYPES);
  }
}
