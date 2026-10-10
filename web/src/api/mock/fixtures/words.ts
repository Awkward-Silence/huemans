/**
 * MOCK DATA. Stand-in for the AI word suggester in api/: one pool per pick
 * after "I". The real words come from the Agents context.
 */
const SENTENCE_QUESTION = { id: "sentence-i", starter: "I", picks: 4 } as const;

const MOCK_WORD_POOLS: readonly (readonly string[])[] = [
  ["secretly", "allegedly", "once", "professionally", "reluctantly", "loudly", "weekly", "still"],
  ["lick", "befriend", "narrate", "collect", "outrun", "apologise-to", "rate", "whisper-to"],
  ["haunted", "borrowed", "municipal", "seventeen-year-old", "tiny", "suspicious", "retired", "my"],
  ["spoons", "pigeons", "vending-machines", "disappointments", "goats", "lighthouses", "kettles"],
];

export { MOCK_WORD_POOLS, SENTENCE_QUESTION };
