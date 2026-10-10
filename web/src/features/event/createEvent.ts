import { z } from "zod";
import { eventCopy } from "../../content/event.ts";

const EVENT_NAME_MAX_LENGTH = 60;

const EventNameSchema = z
  .string()
  .trim()
  .min(1, eventCopy.name.errors.empty)
  .max(EVENT_NAME_MAX_LENGTH, eventCopy.name.errors.tooLong(EVENT_NAME_MAX_LENGTH));

/** Optional; "meetup.com/x" is accepted and becomes "https://meetup.com/x". */
const InfoUrlSchema = z
  .string()
  .trim()
  .transform((value) => (value && !/^https?:\/\//i.test(value) ? `https://${value}` : value))
  .pipe(z.union([z.literal(""), z.url({ protocol: /^https?$/, error: eventCopy.infoUrl.error })]))
  .transform((value) => value || undefined);

type CreateEventInput = { name: string; infoUrl?: string };

type CreatedEvent = CreateEventInput & {
  eventId: string;
  /** What the QR code encodes: the attendee entry point for this event. */
  joinUrl: string;
};

/** The event every phone joins until `POST /events` is wired in. */
const DEMO_EVENT_ID = "demo";

const joinUrlFor = (eventId: string, origin = window.location.origin) =>
  `${origin}/join/${encodeURIComponent(eventId)}`;

/**
 * Creates the event. Provisional: the backend's `POST /events` is not ready yet,
 * so every event points at the demo event that is already running.
 * When it is, post `{ name }` there and use the returned id.
 */
function createEvent(input: CreateEventInput): Promise<CreatedEvent> {
  return Promise.resolve({ ...input, eventId: DEMO_EVENT_ID, joinUrl: joinUrlFor(DEMO_EVENT_ID) });
}

export { createEvent, EVENT_NAME_MAX_LENGTH, EventNameSchema, InfoUrlSchema, joinUrlFor };
export type { CreatedEvent, CreateEventInput };
