# Proposal

## Why

The flow ends with ONE icebreaker shared by everyone that night. That gives every attendee the same opening line to approach anyone in the room. It should fit the people actually present, and revealing it is the climax of a 2-3 minute live demo, so the presenter needs to control when it happens.

## What Changes

- Add the host's reveal to the Event context (`Event.reveal`, see `docs/domain/event/model.md`): status moves from `open` to `revealed` and Event emits `EventRevealed { eventId }`. A second reveal is a no-op that succeeds and emits nothing.
- Add a Night Icebreaker bounded context that subscribes to `EventRevealed` (synchronous, in-process). It aggregates the trait profiles of all attendees into a room profile and picks the catalog icebreaker whose traits best match it. The choice is stored in Night Icebreaker's own aggregate, not on the event, and does not change afterwards.
- To have the room's traits at the reveal, Night Icebreaker also subscribes to `QuestionnaireCompleted` and keeps each attendee's weighted traits per event (no other context stores them).
- Serve the icebreaker over REST: `GET /events/:eventId/attendees/:attendeeId/icebreaker` in the shape `web/` already polls (`locked` | `ready` with `question`, `why`, `meetingSpot`, `gatherEndsAt`), and `GET /events/:eventId/icebreaker` for the host screen. Attendees who reload or arrive after the reveal get it on their next poll. A realtime push is out of scope: the web polls every 2 s. When it comes, it will be Server-Sent Events (not WebSockets) carrying the same shapes.
- Late joiners can still answer and get a color after the reveal, but they don't change the chosen icebreaker.

## Capabilities

### New Capabilities
- `night-icebreaker`: revealing an event, selecting the single icebreaker from the room's trait profile, and delivering it to everyone.

### Modified Capabilities

## Impact

- New host endpoint in `api/` (`POST /events/:eventId/reveal`), `Event.reveal` and `EventRevealed` in the Event context (the `revealed` status value already exists), a new `NightIcebreaker` module with its own tables, two icebreaker read endpoints whose shapes go into `contracts/nightIcebreaker.d.ts`, and `docs/api/attendee-api.md` updated.
- `web/` in `http` mode can drop the mock for `getIcebreaker`.
- Host screen (Miguel) gets the "reveal icebreaker" button, and the attendee flow (Daniel) gets the final icebreaker screen.
- Depends on `create-event` (the Event aggregate), `quiz-and-answers` (trait profiles) and `backend-skeleton-and-catalog`.
- Owner: Adrián.
