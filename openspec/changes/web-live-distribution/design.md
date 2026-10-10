# Design

## Context

The domain contract is `docs/domain/room/model.md` (Accepted):
- Room is a read-only context with no aggregate and no events;
- read model `RoomView`;
- value objects `AttendeeCount`, `GroupCount` and `GroupCountCollection`, plus `SK::EventId` and the new `SK::Color`;
- three ports: `EventLookup`, `GroupCounter` and `JoinedAttendeeCounter`.

Code uses those names. Requirements are in `specs/room/spec.md` and `specs/demo-event/spec.md`; motivation is in `proposal.md`.

Current state:
- `Color` lives in `ColorDistribution/Domain/ValueObject/Color.ts`.
- `EventModule` exports Event's `ApplicationService`, whose `eventOf` throws `EventNotFound`.
- `ColorDistributionModule` exports nothing. Its `ApplicationService.distributionOf` returns `EventDistributionView | null`.
- Participation does not exist yet.
- `Event.create` takes its id, and the Event `ApplicationService` always passes `EventId.random()`.

## Goals / Non-Goals

**Goals:**
- `GET /events/:eventId/room`, exactly as modeled.
- `SK::Color` in code.
- A repeatable seed for a demo event with a fixed UUIDv7.
- The web's demo link pointing at that event in HTTP mode.

**Non-Goals:**
- Participation's real joined count. `quiz-and-answers` replaces the stub adapter, and the port stays.
- The full attendee flow end to end over HTTP. Join, quiz and answers need Participation.
- Realtime push, the host screen and the icebreaker.
- Changing `GET /events/:eventId/distribution`, which stays for the host screen.

## Decisions

**`Color` moves to `Shared/Domain/ValueObject/Color.ts`, unchanged.**
- Color Distribution's imports and `docs/domain/color-distribution/model.md` change to `SK::Color`.
- Its unit test moves to `tests/Unit/Shared/`.
- Alternative considered: Room importing Color Distribution's `Color`. Rejected, because the model puts it in the shared kernel and a context must not reach into another context's domain.

**Room domain (`src/Room/Domain`, no NestJS or ORM imports).**
- `AttendeeCount` is a `NumberValueObject` that accepts whole numbers ≥ 0 and throws `InvalidArgumentError` otherwise.
- `GroupCount` holds an `SK::Color` and an `AttendeeCount`.
- `GroupCountCollection` extends the shared `Collection`. It requires exactly the four colors, in `SK::Color` order. It exposes `answered(): AttendeeCount` (the sum) and `toDTO()`.
- `RoomView` is a plain interface `{ eventId, total, answered, groups: { color, count }[] }`. `RoomView.of(eventId, joined, groups)` builds it, so the sum is computed in the domain and never in the application service.
- `RoomNotFound` is a `NotFoundError`, which `NotFoundErrorFilter` maps to `404`.

**Ports in `Room/Domain/Port`, with adapters in `Room/Infrastructure/<producer>/`:**
- `EventLookup.exists(EventId): Promise<boolean>`. The adapter calls Event's `ApplicationService.eventOf` and answers `false` on `EventNotFound`. Alternative considered: adding an `exists` method to Event's service. Rejected, because the read already exists and Room's adapter is the only place that needs a boolean.
- `GroupCounter.countsOf(EventId): Promise<GroupCountCollection>`. The adapter maps Color Distribution's `distributionOf` (`members` → `count`). `ColorDistributionModule` starts exporting its `ApplicationService`. A missing distribution for an existing event cannot happen, because `EventCreated` opens it synchronously, so the adapter treats it as an error and the request fails with `500`.
- `JoinedAttendeeCounter.joinedIn(EventId): Promise<AttendeeCount>`. The stub adapter, `AnsweredAsJoinedAttendeeCounter`, returns `GroupCounter.countsOf(id).answered()`, so `total = answered`. `quiz-and-answers` swaps the provider in `RoomModule` and changes nothing else.

**Application service.** `Room/Application/ApplicationService.roomOf(eventId): Promise<RoomView>`:
1. Check `exists`, and throw `RoomNotFound` if the event is unknown.
2. Read the counts and the joined count.
3. Return `RoomView.of(...)`.

**HTTP.**
- `RoomController` serves `GET /events/:eventId/room` with the shared `UuidV7Param` (`400` for a malformed id).
- The response is `RoomView` as is. `eventId` is extra to the web's `RoomSchema`, which ignores unknown keys.
- The wire type goes into `contracts/room.d.ts` as `RoomResponse`.
- `RoomModule` imports `EventModule` and `ColorDistributionModule`, and is registered in `AppModule`.

**Demo event seed.**
- Event's `ApplicationService` gets `ensure(eventId, name): Promise<EventView>`. It returns the existing event unchanged, or creates it with the given id and dispatches `EventCreated`. That is the same path as `create`, so the distribution opens.
- `DemoEventSeeder`, in `Event/Infrastructure/Seed`, holds the fixed id `0199c0de-0000-7000-8000-000000000001` and the name `Demo night`, and calls `ensure`.
- The CLI entry `Event/Infrastructure/Cli/seedDemoEvent.ts` boots `NestFactory.createApplicationContext(AppModule)`, runs the seeder and closes. `pnpm seed:demo` (`dotenv -e .env -- ts-node -r tsconfig-paths/register ...`) runs it.
- Alternative considered: seeding on every app boot. Rejected, because an explicit command keeps tests and production free of a hidden event, and the operator runs it once per database.
- The id is a valid UUIDv7 with a recognizable pattern. It is not time-ordered, and that is harmless for one demo row.

**Web.**
- `config.ts` reads `VITE_DEMO_EVENT_ID` into `demoEventId`, with a default of `"demo"`.
- `HomeScreen` and `StatusScreens` link to `config.demoEventId` instead of the literal `"demo"`.
- `.env.example` documents setting it to the seeded id when `VITE_API_MODE=http`. Mock mode keeps `demo`, because the mock accepts any id.
- No schema change.

**CORS.**
- The web (`:5173`, or its own host) calls the API cross-origin, and the API sent no CORS headers, so a browser in HTTP mode blocked every request. This was found while verifying task 5.2.
- `configureApp` calls `enableCors` with the origin from `CORS_ORIGIN` (`config.corsOrigin`, default `*`).
- `*` is safe: the API is anonymous and uses no cookies or credentials. A deployment can pin the web's origin through the env var.
- Alternative considered: a Vite dev proxy. Rejected, because it only fixes local dev and every hosting setup would need the same trick again.

**Tests (outside-in).**
- Functional: every scenario in `specs/room/spec.md`, using `publish(EventCreated / QuestionnaireCompleted)` like the Color Distribution tests. Also seeding the demo event, then idempotency with `recordPublished('event.created')` empty on the second run.
- Unit: `AttendeeCount` bounds, `GroupCountCollection` (missing, repeated or misordered color rejected; `answered` sums) and `RoomView.of`. `Color` keeps its test under `Shared`.
- Web: a vitest for the demo link using `config.demoEventId`.
- No integration tests. Room persists nothing, and its adapters call other contexts in-process, which the functional tests cover against Postgres.
- No unit tests for the application service.

## Risks / Trade-offs

- [The stub makes `total = answered`, so the "waiting for others" screen shows everyone as done] → Accepted until `quiz-and-answers`. It is one provider swap, recorded as a task there.
- [Each poll reads the distribution twice (counts, and the stub's joined count)] → Polling every 2 s for 15 people is negligible. The second read disappears with the real Participation adapter.
- [Catching `EventNotFound` for control flow in `EventLookup`] → Contained in one adapter. If Event later exposes an existence read, only the adapter changes.
- [The fixed demo id has to match between `api/` and `web/.env`] → It is documented in `.env.example` and in `docs/api/attendee-api.md` (gap 5).
