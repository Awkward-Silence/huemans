import type { GroupColor } from "../domain/groupColor.ts";

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six"];
const numberWord = (n: number) => NUMBER_WORDS[n] ?? String(n);
const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

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
  welcome: {
    event: (app: string, event: string) => `${app} · ${event}`,
    live: "still running",
    title: (name: string) => ["Welcome back,", `${name}.`] as const,
    body: "Your phone kept your place. Nothing was lost while you were away.",
    progressLabel: (answered: number, total: number) => `${answered} of ${total} answered`,
    cta: "Pick up where you left off",
    footnote:
      "Same link, same phone. There is no account to sign back into, and answers you already gave stay as they are.",
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
  sentence: {
    lastOne: "last one",
    title: "Finish the sentence",
    hint: "Three words, picked for you just now. Tap one.",
    thinking: "Finding three good ones…",
    timeUpHint: (left: number) =>
      `The clock stopped, nothing else did. Take your ${left === 1 ? "last word" : `${numberWord(left)} words`}.`,
    timeUpPill: "Time's up, carry on",
    progress: (picked: number, total: number) => `${picked} of ${total} words`,
    loadingStatus: "Three more coming, one second.",
    skip: "Skip the sentence",
    /** The note under "skip", by how many words are left. */
    footer: (left: number, total: number) =>
      left === total
        ? "Nothing here changes your colour. It's just for fun."
        : left === 1
          ? "One word to go."
          : `${capitalise(numberWord(left))} more words and it's yours for the night.`,
    footerLoading: "Your sentence stays put while they load.",
    footerTimeUp: "The room waits for the last person. That is the whole point.",
    done: "That'll do it",
    doneNote: "It's yours to keep, nowhere near your colour.",
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
    sentenceLabel: "You, in one sentence",
    sentence: (sentence: string) => `“${sentence}”`,
    cta: "Tonight's icebreaker",
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
    lockedBody: "The icebreaker unlocks when the last person finishes. It shows up here by itself.",
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
