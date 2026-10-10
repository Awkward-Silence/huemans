// Provisional codes until the catalog names the types.
export const PERSONALITY_TYPES = ['explorer', 'connector', 'planner', 'dreamer'] as const;

export type PersonalityTypeValue = (typeof PERSONALITY_TYPES)[number];
