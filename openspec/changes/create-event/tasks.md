# Tasks

## 1. Contracts and event ownership

- [x] 1.1 Add `CreateEventRequest` and `EventResponse` as type-only definitions in `contracts/event.d.ts`, and verify `api/` type-checks when importing them with `import type`
- [x] 1.2 Move `EventCreated` from `api/src/Shared/Domain/Event/` to `api/src/Event/Domain/`, update the Color Distribution subscriber and functional tests to import it from there, and verify `pnpm test:functional` still passes

## 2. Domain (unit tests first, no NestJS or ORM imports)

- [x] 2.1 Implement `EventName` (trimmed, 1-255 characters), and verify unit tests reject a blank and a 256-character name, accept 255 characters, and keep the trimmed value
- [x] 2.2 Implement `EventStatus` (`open`, `revealed`, public constructor), and verify a unit test rejects an unknown value
- [x] 2.3 Implement `Event.create` (starts `open`, records `EventCreated` once) and `toDTO()` returning `EventView`, and verify unit tests cover the status, the pulled event and the view

## 3. Persistence

- [x] 3.1 Add the hand-written `events` migration, and verify `pnpm migration:up` and `pnpm migration:up:test` apply it and it rolls back on a clean database
- [x] 3.2 Add `EventSchema.ts`, the `EVENT_REPOSITORY` port and `MikroOrmEventRepository` (`save`, `search`), and verify an integration test saves and reloads an event as an `Event` with the same values, and returns null for an unknown id

## 4. Application and HTTP

- [x] 4.1 Move the `UuidV7Param` pipe to `Shared/Infrastructure/Http`, use it from the Color Distribution controller, and verify the existing functional tests still pass
- [x] 4.2 Write the functional tests for `POST /events` (created open with quiz settings 5 and 20, same name twice, trimmed name) and `GET /events/:eventId` (created event, unknown 404, malformed 400) in red
- [x] 4.3 Implement `Event/Application/ApplicationService` (`create`, `eventOf` with `EventNotFound`), `EventController` with the zod payload and the placeholder quiz-settings constants, and `EventModule` (exporting the application service) registered in `AppModule`, and verify the 4.2 tests pass
- [x] 4.4 Add functional tests for the name validation scenarios (blank, missing, 255 accepted, 256 rejected) with no `EventCreated` published on rejection, and verify they pass

## 5. Cross-context flow and docs

- [x] 5.1 Verify with a functional test that creating an event publishes exactly one `EventCreated` with its id and that `GET /events/:eventId/distribution` then returns four empty groups
- [x] 5.2 Update `docs/api/attendee-api.md` (create event defined, `status` added, gap 6 resolved), and verify `pnpm lint && pnpm build && pnpm test` pass
