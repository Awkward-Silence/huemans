# Tasks

## 1. Participation domain

- [x] 1.1 Move `QuestionnaireCompleted` from `src/Shared/Domain/Event/` to `src/Participation/Domain/` and update the imports in `Questionnaire`, Color Distribution and Night Icebreaker; verify `pnpm lint && pnpm build` and `pnpm test:functional` pass
- [x] 1.2 Add `AttendeeName` (trimmed, 1-40 characters) and the `Attendee` aggregate (`join` records `AttendeeJoined`, `toDTO()`), with the `AttendeeRepository` port (`save`, `searchIn`, `countIn`) and `AttendeeNotFound`, test-first in `tests/Unit/Participation/Domain/Attendee.test.ts` and `ValueObject/AttendeeName.test.ts`; verify with `pnpm jest tests/Unit/Participation`
- [x] 1.3 Add `QuizSettings.standard()` (5 questions, 20 s), `QuizQuestion` (no trait) and `Quiz.for(eventId, questions, settings)` (FNV-1a seed, seeded shuffle, one question per theme first, fill when themes run out, `toDTO()`), test-first in `tests/Unit/Participation/Domain/Quiz.test.ts` covering the same order for the same event, a different order for another event, 5 distinct themes, the fill case with fewer themes than questions, and answers in catalog order; verify with `pnpm jest tests/Unit/Participation`

## 2. Persistence

- [ ] 2.1 Add the migration for `attendees` (`id` PK, `event_id` indexed, `name`, `joined_at`); verify `pnpm migration:up && pnpm migration:up:test` apply cleanly
- [ ] 2.2 Add `AttendeeSchema` and `MikroOrmAttendeeRepository`, test-first in `tests/Integration/Participation/Infrastructure/Persistence/MikroOrmAttendeeRepository.test.ts` (saves and finds an attendee, finds nothing for another event, counts only that event's attendees); verify with `pnpm jest tests/Integration/Participation`

## 3. Use cases and HTTP

- [ ] 3.1 Add a `joinAttendee(app, eventId, name?)` helper in `tests/Support/` and make the functional tests that submit answers (`Participation/SubmitAnswers`, `NightIcebreaker/*`) join first; verify they still pass before the attendee check exists
- [ ] 3.2 Add `ApplicationService.join` and `AttendeesController` (`POST /events/:eventId/attendees`, 201 `{ attendeeId }`), test-first in `tests/Functional/Participation/JoinEvent.test.ts` covering 201 with a UUIDv7, two joins with the same name, joining a revealed event, 400 for an empty/blank/too long/missing name and a malformed event id, and 404 for an unknown event; verify with `pnpm jest tests/Functional/Participation`
- [ ] 3.3 Add the attendee check to `submit` (`AttendeeNotFound` → 404), test-first in `SubmitAnswers.test.ts` with an attendee who never joined (distribution unchanged) and an attendee of another event; verify with `pnpm jest tests/Functional/Participation`
- [ ] 3.4 Add `allQuestions` to the `QuestionCatalog` port and `CatalogQuestionCatalog`, `ApplicationService.quizOf(eventId)` and `QuizController` (`GET /events/:eventId/quiz`), test-first in `tests/Functional/Participation/GetQuiz.test.ts` covering the shape (5 × 4 answers, `durationSeconds` 20, no `trait` key), the same quiz twice, not every new event getting the same quiz, 5 distinct themes, a revealed event, 404 and 400; verify with `pnpm jest tests/Functional/Participation`
- [ ] 3.5 Replace the placeholder constants in `EventController` with `QuizSettings.standard()`, and add `testTheEventAndItsQuizAgree` to `GetQuiz.test.ts`; verify with `pnpm jest tests/Functional/Event tests/Functional/Participation`

## 4. Room

- [ ] 4.1 Add `ApplicationService.joinedCount(eventId)` and `ParticipationJoinedAttendeeCounter`, replacing `AnsweredAsJoinedAttendeeCounter` in `RoomModule`, test-first in `tests/Functional/Room/GetRoom.test.ts` (three joined, one answered → `total` 3, `answered` 1; empty event → 0 and 0) with the existing cases joining first; verify with `pnpm jest tests/Functional/Room`

## 5. Contracts, docs and web

- [ ] 5.1 Add `JoinRequest`, `JoinResponse` and `QuizResponse` to `contracts/participation.d.ts` and use them in the controllers; verify `pnpm build`
- [ ] 5.2 Update `docs/api/attendee-api.md` (endpoints 2-4: name rules, 201, deterministic quiz, 404 for an attendee who never joined; endpoint 6: `total` from joins) and `CLAUDE.md` (change status); verify the docs no longer say join comes later or that `total` equals `answered`
- [ ] 5.3 In `web/src/api/index.ts`, use the HTTP client for `join` and `getQuiz`, adding the mock's sentence question to the HTTP quiz while the API serves none; verify `npm run typecheck && npm test` in `web/`
- [ ] 5.4 If `api/tests/E2E/VirtualNight.test.ts` is on the branch, make each virtual person join and answer the event's quiz instead of random catalog questions; verify with `pnpm test:e2e` against a running API
- [ ] 5.5 Run the full checks; verify `pnpm lint && pnpm build && pnpm test` pass in `api/`, and manually with `VITE_API_MODE=http` and a newly created event: join on two phones, both see the same quiz, submit, the room shows the joined count, reveal shows the icebreaker
