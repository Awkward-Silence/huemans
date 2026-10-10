# Proposal

## Why

Everything in the demo hangs off an event: the QR code encodes its URL, and Color Distribution opens a distribution when an event is created. Color Distribution already subscribes to `EventCreated`, but nothing publishes it yet. Splitting event creation out of the old `event-join-and-answers` change gives it its own lane with no catalog dependency, so it can ship before the quiz exists.

## What Changes

- Add an Event bounded context in `api/src/Event/`, following `docs/domain/event/model.md`: an `Event` aggregate with an id, a name and a status.
- `POST /events` creates an event from a name. The aggregate gets a new `EventId` (UUIDv7) and starts in status `open`.
- Publish `EventCreated { eventId }` after the event is stored. The event moves from the shared kernel folder into the Event context, which owns it, and Color Distribution's subscriber imports it from there. Handlers stay synchronous and in-process.
- `GET /events/:eventId` returns `{ id, name, status, questionCount, quizDurationSeconds }`, the shape `web/` already reads (endpoint 1 in `docs/api/attendee-api.md`) plus `status`. Unknown event → `404`; malformed id → `400`.
- The quiz settings are not part of Event. They are fixed for the MVP (5 questions, 20 s) and belong to Participation's quiz. Until `quiz-and-answers` lands, the event endpoint returns the two fixed values itself; that change then makes the endpoint read them from Participation.
- Other contexts can read an event in-process to check that it exists, so Participation and word suggestions can return `404` for unknown events.
- Out of scope:
  - picking questions (`quiz-and-answers`);
  - the host's reveal (`open` → `revealed`, `EventRevealed`), which `night-icebreaker` adds to the same aggregate;
  - the QR code itself (the web URL is enough).

## Capabilities

### New Capabilities
- `event`: creating an event, reading it, and announcing it to the other contexts.

### Modified Capabilities

## Impact

- New `Event` module in `api/`, with its migration.
- `EventCreated` moves from `api/src/Shared/Domain/Event/` into `api/src/Event/Domain/`. Color Distribution's subscriber and functional tests import it from there.
- Unblocks:
  - `quiz-and-answers` (event lookup);
  - `night-icebreaker` (the reveal on the same aggregate);
  - `word-suggestions` (its provisional `EventDirectory`).
- The host screen (Miguel) uses `POST /events` to create the demo event.
- Owner: Adrián.
