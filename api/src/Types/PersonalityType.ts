import type { TraitValue } from './Trait';

// The four personality types; TRAIT_TYPES (TraitTypeMapping.ts) places every trait in exactly one of them.
export const PERSONALITY_TYPES = ['explorer', 'connector', 'planner', 'dreamer'] as const;

export type PersonalityTypeValue = (typeof PERSONALITY_TYPES)[number];

export interface PersonalityTypeProfile {
  /** Title shown at the reveal. */
  nickname: string;
  /** One-paragraph description shown under the title. */
  blurb: string;
  /** Chips shown at the reveal; each trait maps to this type in the provisional trait-type mapping. */
  traits: TraitValue[];
}

// Static reveal copy per type; the ColorExplainer agent may personalize it later, with this as the fallback.
export const PERSONALITY_TYPE_PROFILES: Record<PersonalityTypeValue, PersonalityTypeProfile> = {
  explorer: {
    nickname: 'The Explorers',
    blurb:
      'You said yes before you heard the question. If there is a door nobody has opened yet, you are already behind it.',
    traits: ['adventurous', 'curious', 'spontaneous'],
  },
  connector: {
    nickname: 'The Connectors',
    blurb:
      'You remember names, birthdays and the thing somebody said three months ago. Rooms get warmer when you walk in.',
    traits: ['sociable', 'empathetic', 'humorous'],
  },
  planner: {
    nickname: 'The Planners',
    blurb: 'You read the instructions. Twice. Then you explain them better than the instructions did.',
    traits: ['analytical', 'organized', 'practical'],
  },
  dreamer: {
    nickname: 'The Dreamers',
    blurb: 'You see the story in everything, and you would rather it end beautifully than sensibly.',
    traits: ['creative', 'romantic', 'nostalgic'],
  },
};
