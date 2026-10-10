import { EnumValueObject } from '../../../Shared/Domain/ValueObject/EnumValueObject';

// The themes a question or icebreaker belongs to.
export const THEMES = [
  'animals',
  'awkward-moments',
  'celebrations',
  'childhood',
  'food',
  'friendship',
  'future',
  'home',
  'hypothetical',
  'love',
  'money',
  'music-and-movies',
  'nature',
  'school',
  'shopping',
  'sports',
  'technology',
  'travel',
  'weekend',
  'work',
] as const;

export type ThemeValue = (typeof THEMES)[number];

export class Theme extends EnumValueObject<ThemeValue> {
  constructor(value: string) {
    super(value, THEMES);
  }
}
