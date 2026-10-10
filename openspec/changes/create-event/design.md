# Design

## Context

The domain contract is `docs/domain/event/model.md`:
- aggregate `Event`, with actions `create` and `reveal`;
- value objects `SK::EventId`, `EventName` and `EventStatus`;
- read model `EventView`;
- events `EventCreated` and `EventRevealed`, owned by the Event context.

Code uses those names. Requirements are in `specs/event/spec.md`; motivation is in `proposal.md`.

`api/` already has the `ColorDistribution` context, which serves as the template. `EventCreated` exists today in `api/src/Shared/Domain/Event/`. It carries only the event id, as `aggregateId`. `OpenDistributionOnEventCreated` subscribes to it, and three Color Distribution functional tests publish it. `InMemoryEventDispatcher.dispatchAll` awaits each subscriber in turn.

## Goals / Non-Goals

**Goals:**
- `Event.create` and `EventView`, exactly as modeled.
- `EventCreated` owned by the Event context and published after the save.
- A read other contexts can call in-process to check that an event exists.

**Non-Goals:**
- `Event.reveal` and `EventRevealed`. The model defines them, and `night-icebreaker` implements them together with the host's reveal endpoint.
- The quiz settings as domain data. Participation owns them (see the model).
- The other contexts' adapters to this read. They are built in `quiz-and-answers` and `word-suggestions`.
- A demo event with a fixed id (`web-live-distribution`), host auth, and listing events.

## Decisions

**Model in code.**
- `Event` has a private constructor and a factory, `Event.create(id: EventId, name: EventName)`. It starts the event `open` and records `EventCreated`. `toDTO()` returns `EventView { id, name, status }`.
- `EventName` is a `StringValueObject` that trims the text and requires 1-255 characters. `EventStatus` is an `EnumValueObject` with `open` and `revealed`, the closed set from the model. It declares a public constructor so `VO.enum` can build it.
- `revealed` exists in the value set now, so `night-icebreaker` adds behaviour without a new column.

**`EventCreated` moves to `Event/Domain/EventCreated.ts`, unchanged.** The model makes Event's events Event's own, and consumers import them from the Event context. Its event name (`event.created`) and payload stay the same. `OpenDistributionOnEventCreated` and the three Color Distribution functional tests change only their import. Alternative considered: re-exporting it from Shared. Rejected, because it keeps the wrong owner visible.

**Quiz settings at the boundary.** `GET /events/:eventId` must return `questionCount` and `quizDurationSeconds`, but Event's domain does not know them. For now `EventController` adds them from two constants in `Event/Infrastructure/Http`, with a comment that they are a placeholder for Participation's quiz settings. `quiz-and-answers` replaces the constants with a read from Participation's application service. Alternative considered: putting the values in Event's domain until then. Rejected, because the model puts them outside Event.

**Validation.**
- A zod schema (`{ name: string }`) for `POST /events`, through the existing `ZodValidationPipe`, checks the shape. This is the first `@Body` in the API.
- `EventName` enforces trimming and length, and throws `InvalidArgumentError`. `DomainErrorFilter` already maps that to `400`.
- The length lives in the value object rather than zod, so the seed in `web-live-distribution` cannot create an invalid name.

**Application service.** `Event/Application/ApplicationService`:
- `create(name): Promise<EventView>` builds the value objects, generates the id with `EventId.random()`, saves, then dispatches the pulled events.
- `eventOf(eventId): Promise<EventView>` throws `EventNotFound` (a `NotFoundError`), which maps to `404`.

A single insert needs no explicit transaction.

**Cross-context read.** `EventModule` exports its `ApplicationService`. Other contexts call `eventOf` from an adapter in their own `Infrastructure/`, behind a port in their own `Domain/Port`.

**Synchronous announcement after the save.** The service dispatches only once the save has succeeded and awaits it, so the distribution is open before `201` is returned. A failed save publishes nothing. If a subscriber throws, the event stays stored and the request fails with `500`. That is accepted: the save is the step that realistically fails, and nothing re-publishes `EventCreated`, so the host creates a new event.

**Persistence.**
- Table `events(id uuid primary key, name text not null, status text not null)`, created by a hand-written migration, `Migration<timestamp>_event.ts`.
- `EventSchema.ts` maps the table with `VO.uuid(EventId)`, `VO.string(EventName)` and `VO.enum(EventStatus)`.
- `MikroOrmEventRepository` extends `MikroOrmRepository`, with `save` and `search(id): Event | null` behind the `EVENT_REPOSITORY` port. That matches the model's `EventRepository.search`.

**HTTP.**
- `EventController` serves `POST /events` (`201`) and `GET /events/:eventId`.
- The `UuidV7Param` pipe moves from the Color Distribution controller to `Shared/Infrastructure/Http`, so both controllers use it.
- Wire types go into `contracts/event.d.ts` as `CreateEventRequest` and `EventResponse`.

**Tests (outside-in).**
- Functional: every scenario in the spec, including the distribution being open after create and `EventCreated` published once (`recordPublished`).
- Unit: `Event.create` (starts `open`, records one `EventCreated`, `toDTO`), `EventName` bounds and trimming, `EventStatus` values.
- Integration: the repository saving and reloading an event against Postgres, and an unknown id.
- No unit tests for the application service or the payload.

## Risks / Trade-offs

- [The quiz-settings constants could outlive their placeholder role] → `quiz-and-answers` has a task to replace them, and the functional test keeps checking 5 and 20 either way.
- [Moving `EventCreated` touches Color Distribution] → It is an import-only change, covered by Color Distribution's existing functional tests.
- [Anyone can create events, since there is no host auth] → Acceptable for a 24h demo. Ids are unguessable UUIDv7s.
- [A subscriber failure after the save leaves the event without a distribution, and nothing re-publishes `EventCreated`] → Accepted for the demo. Subscribers are in-process and the realistic failure is the save, which publishes nothing. The host creates a new event.
