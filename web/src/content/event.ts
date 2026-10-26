/**
 * Copy for the host's "create an event" page (/event).
 * Kept apart from en.ts so this page can grow without touching the attendee copy.
 */
const eventCopy = {
  eyebrow: "New event",
  title: "Set up tonight's room",
  name: {
    label: "What's the event called?",
    placeholder: "Friday Meetup",
    hint: (max: number) => `${max} characters max. Attendees see it when they join.`,
    errors: {
      empty: "Give the event a name first.",
      tooLong: (max: number) => `Keep it to ${max} characters.`,
    },
  },
  infoUrl: {
    label: "Where can people read more?",
    placeholder: "meetup.com/your-event",
    hint: "Optional. A link to the event page or agenda.",
    error: "That doesn't look like a link.",
  },
  submit: "Create the event",
  createFailed: "We couldn't create the event. Try again.",
  ready: {
    eyebrow: "Scan to join",
    qrLabel: (name: string) => `QR code to join ${name}`,
    moreInfo: "More info",
    open: "Open the event",
    reveal: "Reveal the icebreaker",
    revealing: "Revealing…",
    revealed: "Icebreaker revealed on every phone",
    revealFailed: "We couldn't reveal the icebreaker. Try again.",
    another: "Create another event",
  },
};

export { eventCopy };
