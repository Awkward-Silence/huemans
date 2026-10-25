# Tasks

## 1. Event reveal

- [x] 1.1 Add `Event.reveal()` and `EventRevealed` (recorded only on open → revealed; `status` no longer readonly), test-first in `tests/Unit/Event/Domain/Event.test.ts` (`testRevealMovesOpenToRevealed`, `testRevealTwiceRecordsOneEvent`); verify with `pnpm jest tests/Unit/Event`
- [x] 1.2 Add `ApplicationService.reveal(eventId)` and `POST /events/:eventId/reveal` in `EventController` (returns `EventResponse`), test-first in `tests/Functional/Event/RevealEvent.test.ts` covering reveal, second reveal, 404 and 400; verify with `pnpm jest tests/Functional/Event/RevealEvent.test.ts`

## 2. Night Icebreaker domain

- [x] 2.1 Add the `RoomProfile` VO (sums weights per trait from `WeightedTrait[]`) and `bestMatch(candidates)` (highest summed weight, ties and empty room → lowest id), test-first in `tests/Unit/NightIcebreaker/Domain/ValueObject/RoomProfile.test.ts`; verify with `pnpm jest tests/Unit/NightIcebreaker`
- [x] 2.2 Add the `IcebreakerCandidate`, `IcebreakerReason` and `MeetingSpot` (closed set per `Color`) VOs, with unit tests for their invariants; verify with `pnpm jest tests/Unit/NightIcebreaker`
- [x] 2.3 Add the `NightIcebreaker` aggregate (`pick` records `NightIcebreakerPicked`, `gatherEndsAt()` = pickedAt + 120 s, `meetingSpotFor(color)`, `toDTO()`) and the ports `RoomTraitsRepository`, `NightIcebreakerRepository`, `IcebreakerCatalog`, `IcebreakerExplainer`, `EventDirectory`, `GroupDirectory`, test-first in `tests/Unit/NightIcebreaker/Domain/NightIcebreaker.test.ts`; verify with `pnpm jest tests/Unit/NightIcebreaker` and `pnpm lint` (no Nest/ORM in `Domain/`)

## 3. Night Icebreaker persistence

- [x] 3.1 Add the migration for `room_traits` and `night_icebreakers`; verify `pnpm migration:up && pnpm migration:up:test` apply cleanly
- [x] 3.2 Add the MikroORM `RoomTraitsRepository` (idempotent insert per attendee, `profileOf` sums every row of the event), test-first in `tests/Integration/NightIcebreaker/Infrastructure/Persistence/MikroOrmRoomTraitsRepository.test.ts` (`testAddingTheSameAttendeeTwiceCountsOnce`, `testProfileSumsOnlyThatEvent`); verify with `pnpm jest tests/Integration/NightIcebreaker`
- [x] 3.3 Add `NightIcebreakerSchema` and the MikroORM `NightIcebreakerRepository` (`save`, `search(eventId)`), test-first in `tests/Integration/NightIcebreaker/Infrastructure/Persistence/MikroOrmNightIcebreakerRepository.test.ts`; verify with `pnpm jest tests/Integration/NightIcebreaker`

## 4. Application, adapters and subscribers

- [x] 4.1 Add the adapters `CatalogIcebreakerCatalog` (Catalog `allIcebreakers`), `StaticIcebreakerExplainer`, `EventContextDirectory` (Event `eventOf`) and `ColorDistributionGroupDirectory` (`assignmentOf`), plus `ApplicationService` (`collect`, `pick`, `forAttendee`, `forHost`) and `NightIcebreakerModule` registered in `AppModule`; verify with `pnpm build`
- [x] 4.2 Add the subscribers `CollectOnQuestionnaireCompleted` and `PickOnEventRevealed`, covered by `tests/Functional/NightIcebreaker/RevealPicksIcebreaker.test.ts`: submit answers with known traits → reveal → the picked icebreaker matches the room; a second reveal and a late submit leave it unchanged; verify with `pnpm jest tests/Functional/NightIcebreaker`

## 5. HTTP and contracts

- [x] 5.1 Add `contracts/nightIcebreaker.d.ts` (`AttendeeIcebreakerResponse`, `HostIcebreakerResponse`) and `NightIcebreakerController` with both GET endpoints, test-first in `tests/Functional/NightIcebreaker/GetIcebreaker.test.ts` covering locked before the reveal, locked without a group, ready with the meeting spot per color, the same question/why/gatherEndsAt for two attendees, a late joiner, host locked/ready, 404 and 400; verify with `pnpm jest tests/Functional/NightIcebreaker`
- [x] 5.2 Run the full suite and the checks; verify `pnpm lint && pnpm build && pnpm test` pass

## 6. Docs and web wiring

- [x] 6.1 Update `docs/api/attendee-api.md` (endpoint 7 behaviour, new reveal and host icebreaker endpoints, remove them from "Missing") and `CLAUDE.md` (change status); verify the docs mention `POST /events/:eventId/reveal`
- [x] 6.2 Drop the `getIcebreaker` mock override in `web/src/api/index.ts`; verify `npm run typecheck && npm test` in `web/`, and manually: with `VITE_API_MODE=http` and a newly created event (never the seeded demo event: nothing can reopen it), submit, `curl -X POST localhost:3000/events/<new event id>/reveal`, and the phone shows the icebreaker

## 7. Review follow-up

- [x] 7.1 Run the reveal and its subscribers in one transaction with the event row locked, so a failed pick rolls the event back to `open` and a second tap retries it, and concurrent reveals run one after the other; verify with `pnpm jest tests/Functional/NightIcebreaker/RevealRetry.test.ts` and `tests/Integration/Event`
