# Design

## Context

`api/` already has the `ColorDistribution` context, which serves as the template. The shared kernel already has `EventId` (UUIDv7, `EventId.random()`) and `EventCreated`, which carries only the event id as `aggregateId`. `InMemoryEventDispatcher.dispatchAll` awaits each subscriber in turn, and `OpenDistributionOnEventCreated` already listens for `EventCreated`. Requirements are in `specs/event/spec.md`; motivation is in `proposal.md`.

There is no `docs/domain/event/` model. The context is a single aggregate with no rules beyond input invariants, so its model is recorded here instead of running `/ddd-bc` for it.

## Goals / Non-Goals

**Goals:**
- An `Event` aggregate that owns its id, name, quiz settings and status, and records `EventCreated`.
- A read other contexts can call in-process to check that an event exists and get its quiz settings.

**Non-Goals:**
- The `open` → `revealed` transition. `night-icebreaker` adds it, together with the second status value.
- The other contexts' adapters (`EventDirectory` in `word-suggestions`, the event lookup in `quiz-and-answers`). They are built in their own changes against the read exposed here.
- A demo event with a fixed id (`web-live-distribution`), auth for the host, listing events and editing them.

## Decisions

**Model.**
- Aggregate `Event`:
  - `id: EventId`, `name: EventName`, `questionCount: QuestionCount`, `quizDuration: QuizDuration`, `status: EventStatus`.
  - Factory `Event.create(id, name, questionCount?, quizDuration?)`. It defaults to 5 questions and 20 seconds, starts the event `open` and records `EventCreated`.
  - `toDTO()` returns `EventView { id, name, questionCount, quizDurationSeconds, status }`.
- Value objects in `Event/Domain/ValueObject`:
  - `EventName`: a string, trimmed, 1-80 characters.
  - `QuestionCount`: an integer from 1 to 10.
  - `QuizDuration`: whole seconds from 5 to 300.
  - `EventStatus`: an enum with only `open` for now.
- The defaults live in the domain, not in the HTTP payload, so that the demo seed and any other caller get the same event as the API.

**Validation in two places, each with its own job.**
- A zod schema for `POST /events`, passed through the existing `ZodValidationPipe`, checks the shape at the edge: field types, integers, optional fields. This is the first `@Body` in the API.
- The value objects enforce the ranges and the trim, which are the invariants. They throw `InvalidArgumentError`, which `DomainErrorFilter` already turns into `400`.
- Alternative considered: putting the ranges in zod only. Rejected, because the aggregate could then be built invalid from any other entry point.

**Lowercase status on the wire.** `status: "open"`, matching the other union fields the web reads (`pending`, `assigned`, `locked`, `ready`). The domain docs keep `OPEN` / `REVEALED` as concept names. The web schema strips unknown keys, so adding `status` changes nothing on the web side.

**Application service.** `Event/Application/ApplicationService`:
- `create(name, questionCount?, quizDurationSeconds?): Promise<EventView>` builds the VOs, generates the id, saves, then dispatches the pulled events.
- `eventOf(eventId): Promise<EventView>` throws `EventNotFound` (a `NotFoundError`, so `404` through the existing filter).

A single insert needs no explicit transaction.

**Cross-context read.** `EventModule` exports its `ApplicationService`. Other contexts call `eventOf` from an adapter in their own `Infrastructure/` behind a port in their own `Domain/Port`, so no context imports another's domain. Alternative considered: an event-existence table in each consumer, filled from `EventCreated`. Rejected, because it duplicates data in one process for no gain.

**Synchronous announcement.** Dispatching after the save, and awaiting it, means the distribution is open before `201` is returned. That is why the spec can promise it. If a subscriber throws, the event stays stored and the request fails with `500`. Accepted, because `open` is idempotent and the demo creates events once, before the room fills.

**Persistence.**
- Table `events(id uuid primary key, name text not null, question_count integer not null, quiz_duration_seconds integer not null, status text not null)`. It has no foreign key to `event_distributions`, because the contexts stay independent.
- The migration is hand-written (`Migration<timestamp>_event.ts`), like the existing one.
- `EventSchema.ts` uses `VO.uuid/string/number/enum`. `EventStatus` declares a public constructor so `VO.enum` can build it.
- `MikroOrmEventRepository` extends `MikroOrmRepository`, with `save` and `search(id): Event | null` behind the `EVENT_REPOSITORY` port.

**HTTP.**
- `EventController` serves `POST /events` (`201`) and `GET /events/:eventId`.
- The `UuidV7Param` pipe moves from the color distribution controller to `Shared/Infrastructure/Http`, so that both controllers use it.
- Wire types go into `contracts/event.d.ts`: `CreateEventRequest` and `EventResponse`.

**Tests (outside-in).**
- Functional: every scenario in the spec, including the distribution being open after create (via `GET /distribution`) and `EventCreated` published once (via `recordPublished`).
- Unit: `Event.create` (defaults, `open`, the event recorded), and each value object's bounds.
- Integration: the repository saving and reloading an event against Postgres, plus an unknown id.
- No unit tests for the application service or the payload.

## Risks / Trade-offs

- [The status field is added before anything reads it] → It is one enum column. `night-icebreaker` extends it instead of adding a migration for a new column.
- [Bounds (80 characters, 1-10 questions, 5-300 s) are guesses] → They live in one value object each, so changing them is a one-line change with its test.
- [Anyone can create events, since there is no host auth] → Acceptable for a 24h demo. Ids are unguessable UUIDv7s.
- [A subscriber failure returns `500` after the event is stored] → Covered by the functional flow test. `open` is idempotent if the creation is reported again.
