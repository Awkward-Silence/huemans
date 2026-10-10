import { EnumValueObject } from './EnumValueObject';

// The 33 character traits an answer or icebreaker can point to; the Catalog content is checked against this list.
export const TRAITS = [
  'adventurous',
  'ambitious',
  'analytical',
  'cautious',
  'chaotic',
  'comfort-loving',
  'competitive',
  'creative',
  'curious',
  'diplomatic',
  'dramatic',
  'easygoing',
  'empathetic',
  'generous',
  'honest',
  'humorous',
  'independent',
  'introverted',
  'loyal',
  'nostalgic',
  'optimistic',
  'organized',
  'patient',
  'perfectionist',
  'practical',
  'rebellious',
  'romantic',
  'skeptical',
  'sociable',
  'spontaneous',
  'stubborn',
  'thrifty',
  'traditional',
] as const;

export type TraitValue = (typeof TRAITS)[number];

export class Trait extends EnumValueObject<TraitValue> {
  constructor(value: string) {
    super(value, TRAITS);
  }
}
