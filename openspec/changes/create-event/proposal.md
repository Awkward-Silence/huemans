# Proposal

## Why

Everything in the demo hangs off an event: the QR code encodes its URL, the quiz is fixed per event, and color distribution opens a distribution when one is created. Color Distribution already subscribes to `EventCreated`, but nothing publishes it yet. Splitting event creation out of the old `event-join-and-answers` change gives it its own lane with no catalog dependency, so it can ship before the quiz exists.

## What Changes

- Add an Event bounded context in `api/src/Event/`.
- `POST /events` creates an event with a name. The aggregate generates its own `EventId` (UUIDv7) and starts in status `OPEN`. It also fixes the quiz settings every phone reads: `questionCount` (default 5) and `quizDurationSeconds` (the soft timer, default 20).
- Publish `EventCreated` (already in the shared kernel) after the event is persisted. Color Distribution reacts by opening the event's distribution.
- `GET /events/:eventId` returns `{ id, name, quizDurationSeconds, questionCount }`, the shape `web/` already reads (endpoint 1 in `docs/api/attendee-api.md`), plus `status`. Unknown event → `404`; malformed id → `400`.
- Expose a way for other contexts to check that an event exists, so Participation and word suggestions can return `404` for unknown events.
- Out of scope: picking questions (that is `quiz-and-answers`), closing the event (`OPEN` → `REVEALED` is `night-icebreaker`), and the QR code itself (the web URL is enough).

## Capabilities

### New Capabilities
- `event`: creating an event with its quiz settings, reading it, and announcing it to the other contexts.

### Modified Capabilities

## Impact

- New `Event` module in `api/`, with its migration.
- Shared kernel: no change (`EventId` and `EventCreated` already exist).
- Unblocks `quiz-and-answers` (event lookup and quiz settings), `night-icebreaker` (event status) and `word-suggestions` (its provisional `EventDirectory`).
- The host screen (Miguel) uses `POST /events` to create the demo event.
- Owner: Adrián.
