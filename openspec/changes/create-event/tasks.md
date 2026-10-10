# Tasks

## 1. Contracts

- [ ] 1.1 Add `CreateEventRequest` and `EventResponse` as type-only definitions in `contracts/event.d.ts`, and verify `api/` type-checks when importing them with `import type`

## 2. Domain (unit tests first, no NestJS or ORM imports)

- [ ] 2.1 Implement `EventName` (trimmed, 1-80 characters), and verify unit tests reject blank and 81-character names and keep the trimmed value
- [ ] 2.2 Implement `QuestionCount` (integer 1-10) and `QuizDuration` (integer seconds 5-300), and verify unit tests reject 0, 11, 4.5, 4 and 301 and accept both bounds
- [ ] 2.3 Implement `EventStatus` (only `open`, public constructor), and verify a unit test rejects an unknown value
- [ ] 2.4 Implement `Event.create` with defaults of 5 questions and 20 seconds, status `open`, `EventCreated` recorded once, and `toDTO()` returning `EventView`, and verify unit tests cover the defaults, explicit settings and the pulled event

## 3. Persistence

- [ ] 3.1 Add the hand-written `events` migration, and verify `pnpm migration:up` and `pnpm migration:up:test` apply it and it rolls back on a clean database
- [ ] 3.2 Add `EventSchema.ts`, the `EVENT_REPOSITORY` port and `MikroOrmEventRepository` (`save`, `search`), and verify an integration test saves and reloads an event as an `Event` with the same values, and returns null for an unknown id

## 4. Application and HTTP

- [ ] 4.1 Move the `UuidV7Param` pipe to `Shared/Infrastructure/Http`, use it from the color distribution controller, and verify the existing functional tests still pass
- [ ] 4.2 Write the functional tests for `GET /events/:eventId` (created event, unknown 404, malformed 400) and `POST /events` (defaults, explicit settings, same name twice, trimmed name) in red
- [ ] 4.3 Implement `Event/Application/ApplicationService` (`create`, `eventOf` with `EventNotFound`), `EventController` with the zod create payload, and `EventModule` (exporting the application service) registered in `AppModule`, and verify the 4.2 tests pass
- [ ] 4.4 Add functional tests for every validation scenario (blank name, question count 0/11/4.5, duration 4/301) returning 400 with no `EventCreated` published, and verify they pass

## 5. Cross-context flow and docs

- [ ] 5.1 Verify with a functional test that creating an event publishes exactly one `EventCreated` with its id and that `GET /events/:eventId/distribution` then returns four empty groups
- [ ] 5.2 Update `docs/api/attendee-api.md` (create event defined, `status` added, gap 6 resolved) and the `EventId` and `EventCreated` rows in `docs/domain/shared-kernel/model.md`, and verify `pnpm lint && pnpm build && pnpm test` pass
