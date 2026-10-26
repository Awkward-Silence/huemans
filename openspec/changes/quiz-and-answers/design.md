# Design

## Context

See proposal.md for the why, and `specs/participation/spec.md` for the behaviour.

What exists in `api/` today:

- **Participation** (`src/Participation`) has one use case, `ApplicationService.submit`, behind `POST /events/:eventId/attendees/:attendeeId/answers`. It checks the event through the `EventDirectory` port, returns early when the `GroupDirectory` (Color Distribution) already has a group, scores the answers through the `QuestionCatalog` port (Catalog's `allQuestions`), lets Jev weigh the sentence, and dispatches `QuestionnaireCompleted` from a transient `Questionnaire` aggregate. It stores nothing and never checks the attendee id.
- `QuestionnaireCompleted` lives in `src/Shared/Domain/Event/`. Color Distribution's `AssignOnQuestionnaireCompleted` and Night Icebreaker's `CollectOnQuestionnaireCompleted` subscribe to it.
- **Event**: `EventController` adds `questionCount: 5` and `quizDurationSeconds: 20` from placeholder constants to `POST /events`, `GET /events/:eventId` and the reveal. `ParticipationModule` imports `EventModule`, so Event can't import Participation's module back without a cycle.
- **Room**: `JoinedAttendeeCounter` is implemented by `AnsweredAsJoinedAttendeeCounter`, a stub that returns the number of grouped attendees.
- **Catalog**: `ApplicationService.allQuestions()` returns `QuestionDTO { id, theme, text, answers: { id, text, trait }[] }`, ordered by id, 53 questions over 20 themes. The content is frozen once seeded.
- **web/**: `web/src/api/index.ts` uses the mock for `join`, `getQuiz` and `suggestWords` in `http` mode. The web's `QuizSchema` takes `{ questions, durationSeconds, sentence? }`; the mock fills `sentence` with `{ id: "sentence-i", starter, picks }`.

## Goals / Non-Goals

**Goals:**
- `web/` in `http` mode runs join → quiz → submit → reveal against `api/` with no mock except word suggestions.
- Participation stays the only context that knows attendees, and keeps its existing ports.

**Non-Goals:**
- Storing answers or `elapsedMs`. Nothing reads them yet; `elapsedMs` stays accepted and ignored.
- Rejecting answers to questions outside the event's quiz. Any catalog question still counts, as today. The web only sends the quiz's questions.
- The quiz's `sentence` field. `word-suggestions` adds it (its task 5.2).
- Attendee names anywhere else (host screen, badges). They are stored, but no read exposes them in this change.
- Realtime push of joins. `AttendeeJoined` is recorded so a later Server-Sent Events feed can use it.

## Decisions

### 1. `Attendee` aggregate, one row per join
`Attendee.join(AttendeeId, EventId, AttendeeName, joinedAt)` records `AttendeeJoined { eventId, attendeeId }`. `AttendeeName` trims and accepts 1-40 characters. The `AttendeeRepository` port has `save`, `searchIn(eventId, attendeeId)` (null when the attendee is missing or belongs to another event) and `countIn(eventId)`. The table is `attendees (id PK, event_id, name, joined_at)` with an index on `event_id`.
`ApplicationService.join(eventId, name)` checks the event through `EventDirectory` (`UnknownEvent` → 404), then saves and dispatches.
*Alternative:* store the attendee on the `Questionnaire`. Rejected: joining and answering are separate moments, and the room needs the joined count before anyone answers.

### 2. `submit` looks the attendee up first
After the event check, `submit` calls `searchIn(eventId, attendeeId)` and throws `AttendeeNotFound` (a `NotFoundError` → 404) when it is null. Everything after that is unchanged. `Questionnaire` stays transient: the "once" rule is still enforced by Color Distribution's assignment, which is already final.
*Alternative:* add `Attendee.completeQuestionnaire()` and persist the answered state. Rejected for now: it duplicates what Color Distribution already guarantees and nothing reads it.

### 3. The quiz is picked in the domain from the event id
`Quiz.for(EventId, QuizQuestion[], QuizSettings)`:
- seed = a 32-bit FNV-1a hash of the event id string; shuffle the catalog questions (sorted by id first) with a small seeded PRNG (mulberry32, Fisher-Yates);
- walk the shuffled list and take the first question of each theme not yet taken until there are `questionCount`; if the catalog has fewer themes, fill the rest from the shuffled list in order;
- answers keep their catalog order and drop the trait (`QuizQuestion` has no trait field).

Pure TypeScript with no `node:crypto`, so it lives in `Domain/` and its unit test pins the order for a fixed event id. The `QuestionCatalog` port gains `allQuestions(): Promise<QuizQuestion[]>`, mapped from Catalog's DTOs in `CatalogQuestionCatalog`.
*Alternatives:* store the picked ids on the event at creation, which needs a write in another context and a migration of existing events; or seed with `sha256`, which pulls `node:crypto` into the domain. Rejected both. Since content is frozen after seeding, the same event always gets the same quiz.

### 4. `QuizSettings` is a Participation value, read statically by Event
`QuizSettings.standard()` returns 5 questions and 20 s. The quiz endpoint uses it, and `EventController` replaces its constants with `QuizSettings.standard().toPrimitives()`. It's a fixed value with no I/O, so importing the value object avoids a module cycle (`ParticipationModule` already imports `EventModule`).
*Alternative:* a port in Event backed by Participation's `ApplicationService`. Rejected: the cycle, for a constant.

### 5. `QuestionnaireCompleted` moves to Participation
`src/Shared/Domain/Event/QuestionnaireCompleted.ts` → `src/Participation/Domain/QuestionnaireCompleted.ts`, same event name and payload. Subscribers in Color Distribution and Night Icebreaker import it from there, as they already import `EventRevealed` from Event.

### 6. HTTP, contracts and Room
- `AttendeesController`: `POST /events/:eventId/attendees` (201, zod `{ name: string }`, name rules in `AttendeeName` → 400 through the domain error filter). `QuizController`: `GET /events/:eventId/quiz`. Both take the event id through `UuidV7Param`.
- `contracts/participation.d.ts` gains `JoinRequest`, `JoinResponse` and `QuizResponse`.
- Room: `ParticipationJoinedAttendeeCounter` calls Participation's `ApplicationService.joinedCount(eventId)` and replaces the stub. `RoomModule` imports `ParticipationModule`.

### 7. web/
`web/src/api/index.ts` uses the HTTP client for `join` and `getQuiz`. While the API quiz has no `sentence`, `getQuiz` adds the mock's sentence question to the HTTP response, so the "I ..." step keeps working; `word-suggestions` removes that line when the API serves it.

## Risks / Trade-offs

- [Tests and scripts that submit for a made-up attendee now get 404] → functional tests (Participation, Night Icebreaker) and `pnpm test:e2e` join first through a shared `joinAttendee` helper in `tests/Support/`.
- [A local database with groups from before this change has `answered` above `total`] → only on dev databases; the room clamps nothing. Recreate the database, or reveal a new event. Production starts empty.
- [A catalog edit changes every event's quiz] → content is frozen after seeding, so it can't happen without recreating the database.
- [Different events can share most questions] → 53 questions over 20 themes; the spec only promises that events don't all get the same quiz.

## Migration Plan

One migration creates `attendees (id uuid PK, event_id uuid not null, name varchar(40) not null, joined_at timestamptz not null)` and an index on `event_id`. Run `pnpm migration:up` and `migration:up:test`. Rollback drops the table. Clients that submit without joining must join first; `web/` already does.
