import { EnumValueObject } from './EnumValueObject';

// The four personality types; the catalog's trait-type mapping places every trait in exactly one of them.
export const PERSONALITY_TYPES = ['explorer', 'connector', 'planner', 'dreamer'] as const;

export type PersonalityTypeValue = (typeof PERSONALITY_TYPES)[number];

export class PersonalityType extends EnumValueObject<PersonalityTypeValue> {
  constructor(value: string) {
    super(value, PERSONALITY_TYPES);
  }
}
