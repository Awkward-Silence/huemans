import { EnumValueObject } from './EnumValueObject';

// Provisional codes until the catalog names the types.
export const PERSONALITY_TYPES = ['explorer', 'connector', 'planner', 'dreamer'] as const;

export type PersonalityTypeValue = (typeof PERSONALITY_TYPES)[number];

export class PersonalityType extends EnumValueObject<PersonalityTypeValue> {
  constructor(value: string) {
    super(value, PERSONALITY_TYPES);
  }
}
