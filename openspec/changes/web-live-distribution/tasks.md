# Tasks

## 1. Shared kernel and contracts

- [x] 1.1 Move `Color` to `api/src/Shared/Domain/ValueObject/Color.ts` (and its unit test to `tests/Unit/Shared/`), update Color Distribution's imports and `docs/domain/color-distribution/model.md` to `SK::Color`, and verify `pnpm lint && pnpm test` pass
- [x] 1.2 Add `RoomResponse` as a type-only definition in `contracts/room.d.ts`, and verify `api/` type-checks when importing it with `import type`

## 2. Room domain (unit tests first, no NestJS or ORM imports)

- [x] 2.1 Implement `AttendeeCount` (whole number ≥ 0), and verify unit tests reject a negative and a fractional count and accept 0
- [x] 2.2 Implement `GroupCount` and `GroupCountCollection` (exactly the four colors in `SK::Color` order, `answered()` sum, `toDTO()`), and verify unit tests reject a missing, repeated or misordered color and sum the counts
- [x] 2.3 Implement `RoomView.of`, `RoomNotFound` and the ports `EventLookup`, `GroupCounter` and `JoinedAttendeeCounter`, and verify a unit test builds a view whose `answered` is the groups' sum

## 3. Room application and HTTP

- [x] 3.1 Write the functional tests for `GET /events/:eventId/room` (new event empty, grouped attendees counted, other events not counted, `total = answered` with the stub, unknown 404, malformed 400) in red
- [x] 3.2 Implement the adapters (`EventLookup` over Event, `GroupCounter` over Color Distribution with `ColorDistributionModule` exporting its service, the `AnsweredAsJoinedAttendeeCounter` stub), `Room/Application/ApplicationService.roomOf`, `RoomController` and `RoomModule` registered in `AppModule`, and verify the 3.1 tests pass

## 4. Demo event seed

- [x] 4.1 Write the functional tests for seeding the demo event (event open with name `Demo night`, room empty; a second run publishes no `EventCreated`) in red
- [x] 4.2 Implement Event `ApplicationService.ensure`, `DemoEventSeeder` with the fixed UUIDv7, the `seedDemoEvent.ts` CLI and the `seed:demo` script, and verify the 4.1 tests pass and `pnpm seed:demo` runs twice against the dev database without errors

## 5. Web and docs

- [x] 5.1 Add `VITE_DEMO_EVENT_ID` (`config.demoEventId`, default `demo`) and use it in the home and status screens' demo links, document it in `web/.env.example`, and verify a vitest for the link plus `npm run typecheck && npm run lint && npm test` pass
- [ ] 5.2 Run the API with the seeded demo event and the web with `VITE_API_MODE=http`, and verify the demo link opens the event intro and that `/events/<demo id>/room` answers the web's `RoomSchema`
- [ ] 5.3 Update `docs/api/attendee-api.md` (gaps 4 and 5 resolved, `Color` reference, `seed:demo`), `CLAUDE.md` (Color in the shared kernel, the seed command), and verify `pnpm lint && pnpm build && pnpm test` pass
