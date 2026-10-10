import { EnumValueObject } from './EnumValueObject';

// Mirrors tools/src/questions/Traits.ts, the catalog's content contract (api never imports tools/).
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
