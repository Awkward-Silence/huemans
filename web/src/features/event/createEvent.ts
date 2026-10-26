import { z } from "zod";
import { api } from "../../api/index.ts";
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

type CreatedEvent = { eventId: string; infoUrl?: string };

/** What the QR code encodes: the attendee entry point for this event. */
const joinUrlFor = (eventId: string, origin = window.location.origin) =>
  `${origin}/join/${encodeURIComponent(eventId)}`;

/**
 * Creates the event. api/ does not store the info URL yet, so it is not sent:
 * it is handed back for the host page to carry in its URL.
 */
async function createEvent({ name, infoUrl }: CreateEventInput): Promise<CreatedEvent> {
  const event = await api.createEvent({ name });
  return { eventId: event.id, infoUrl };
}

export { createEvent, EVENT_NAME_MAX_LENGTH, EventNameSchema, InfoUrlSchema, joinUrlFor };
export type { CreatedEvent, CreateEventInput };
