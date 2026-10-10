import type { GroupColor } from "../../../domain/groupColor.ts";

/**
 * MOCK DATA. Group profiles and trait mapping the mock uses to sort people.
 * The real values come from the Grouping context in api/.
 */
const GROUP_PROFILES: Record<
  GroupColor,
  { nickname: string; blurb: string; traits: string[]; meetingSpot: string }
> = {
  amber: {
    nickname: "The Room Starters",
    blurb:
      "You walk in and the volume goes up. Amber people begin the conversation nobody planned.",
    traits: ["sociable", "spontaneous", "dramatic"],
    meetingSpot: "the bar",
  },
  coral: {
    nickname: "The Name Rememberers",
    blurb: "You remember birthdays, nicknames and the thing somebody said three months ago.",
    traits: ["empathetic", "loyal", "generous"],
    meetingSpot: "the window seats",
  },
  teal: {
    nickname: "The Manual Readers",
    blurb:
      "You read the instructions. Twice. Then you explain them better than the instructions did.",
    traits: ["analytical", "curious", "organized"],
    meetingSpot: "the beer corner",
  },
  violet: {
    nickname: "The Plan Wreckers",
    blurb:
      "You said yes before you heard the question. Violet ruins a good plan in the best possible way.",
    traits: ["adventurous", "rebellious", "chaotic"],
    meetingSpot: "the stage",
  },
};

/** Which group each answer trait (api/src/Shared/Domain/ValueObject/Trait.ts) points to. */
const TRAIT_TO_GROUP: Record<string, GroupColor> = {
  sociable: "amber",
  spontaneous: "amber",
  dramatic: "amber",
  humorous: "amber",
  competitive: "amber",
  optimistic: "amber",
  ambitious: "amber",
  easygoing: "amber",
  empathetic: "coral",
  loyal: "coral",
  generous: "coral",
  romantic: "coral",
  nostalgic: "coral",
  diplomatic: "coral",
  patient: "coral",
  traditional: "coral",
  "comfort-loving": "coral",
  analytical: "teal",
  curious: "teal",
  organized: "teal",
  cautious: "teal",
  perfectionist: "teal",
  practical: "teal",
  thrifty: "teal",
  skeptical: "teal",
  introverted: "teal",
  adventurous: "violet",
  rebellious: "violet",
  chaotic: "violet",
  creative: "violet",
  independent: "violet",
  stubborn: "violet",
  honest: "violet",
};

/** How the simulated crowd splits across groups (relative weights). */
const CROWD_WEIGHTS: Record<GroupColor, number> = { amber: 9, coral: 14, teal: 12, violet: 13 };

/** The one icebreaker everyone gets, with the reason shown under it. */
const ICEBREAKER = {
  question: "What's the last thing you quietly replaced before anyone noticed?",
  why: "31 of you met a dying houseplant with “quietly replace it before anyone notices.” It was the most-agreed answer in the room, so it is the safest thing to ask a stranger.",
};

export { CROWD_WEIGHTS, GROUP_PROFILES, ICEBREAKER, TRAIT_TO_GROUP };
