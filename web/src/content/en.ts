import type { GroupColor } from "../domain/groupColor.ts";

/**
 * Every user-facing string. Screens read from here, never from literals,
 * so copy can be edited (or translated) in one place.
 * Strings that depend on data are functions.
 */
const en = {
  app: {
    name: "huemans",
    loading: "One moment…",
    errorTitle: "Something went sideways",
    errorBody: "We couldn't reach the room. Check your connection and try again.",
    retry: "Try again",
    notFoundTitle: "Nothing here",
    notFoundBody: "Scan the QR code at your event to join.",
  },
  home: {
    title: "huemans",
    body: "Scan the QR code at your event to get your colour.",
    demoLink: "Open the demo event",
  },
  groups: {
    amber: "amber",
    coral: "coral",
    teal: "teal",
    violet: "violet",
  } satisfies Record<GroupColor, string>,
  intro: {
    tagline: "Four colours in this room. One of them is yours.",
    countdown: (seconds: number) => `${seconds} seconds · starts now`,
    start: "Start",
  },
  name: {
    stepLabel: (step: number, total: number) => `Step ${step} of ${total}`,
    label: "What should people call you?",
    description:
      "This goes on your badge later, big enough to read across a room. A first name or a nickname is plenty.",
    placeholder: "Ana",
    hint: (max: number) => `${max} characters max — it has to fit on a phone screen.`,
    errors: {
      empty: "Type a name first.",
      tooLong: (max: number) => `Keep it to ${max} characters.`,
    },
    submit: (seconds: number) => `Start the ${seconds} seconds`,
    privacy: "No sign-up, no email. Your answers are deleted when the event ends.",
    joinFailed: "We couldn't add you to the room. Try again.",
  },
  quiz: {
    positionLabel: (current: number, total: number) => `Question ${current} of ${total}`,
    secondsUnit: "s",
    secondsLeftLabel: (seconds: number) => `${seconds} seconds left`,
    timeUp: "Time's up — take your time to finish.",
    nudge: (seconds: number) =>
      `When the bar empties nothing closes — you still get to finish. The ${seconds} seconds are a nudge, not a gate.`,
    submitting: "Sending your answers…",
    submitFailed: "Your answers didn't send.",
  },
  sorted: {
    stats: (answers: number, seconds: number) => `${answers} answers · ${seconds} seconds`,
    title: (name: string) => [`${name},`, "you're sorted."] as const,
    pending: "Sorting the room…",
    body: (mates: number) =>
      `One of four colours has your name on it. ${mates} people in this room share it.`,
    cta: "Reveal my colour",
    hint: "Hold the phone up when it changes.",
  },
  reveal: {
    eyebrow: "Your colour",
    mates: (color: string) => `others in this room are ${color} too`,
    cta: "See the room",
  },
  room: {
    title: "The room, right now",
    answered: (answered: number, total: number) => `${answered} of ${total} answered`,
    typing: (count: number) => `· ${count} still typing`,
    allIn: "· everyone's in",
    you: "you",
    whyTitle: (mine: string, runnerUp?: string) =>
      runnerUp ? `Why ${mine} and not ${runnerUp}` : `Why ${mine}`,
    lean: "Your answers leaned",
    and: "and",
    fairness: "Groups stay within three people of each other — nobody ends up in a group of two.",
    cta: "Tonight's icebreaker",
    locked: "Unlocks when the last person finishes.",
    ready: "It's ready. Everyone gets the same one.",
  },
  icebreaker: {
    eyebrow: "One question · everyone · tonight",
    whyTitle: "Why this one",
    meet: (color: string, spot: string) => `${color}, meet at ${spot}`,
    heading: (mates: number, color: string) =>
      `${mates} others are heading there. Look for the ${color} screens held up in the air.`,
    gatherLabel: (time: string) => `${time} left to find your group`,
    cta: "Turn my phone into a badge",
    hint: "Screen stays on. Hold it chest height.",
    lockedTitle: "Not yet",
    lockedBody: "The icebreaker unlocks when the last person finishes.",
    backToRoom: "Back to the room",
  },
  badge: {
    group: (color: string, nickname: string) => `${color} · ${nickname}`,
    exit: "Exit",
    exitLabel: "Leave badge mode",
    callout: ["Ask me", "anything"] as const,
    rotateHint: "Turn sideways to scroll it",
  },
};

type Copy = typeof en;

export { en };
export type { Copy };
