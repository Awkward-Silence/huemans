# Tasks

## 1. Contracts and shared kernel

- [x] 1.1 Add `AttendeeGrouped`, the distribution view and the attendee assignment response as type-only definitions in `contracts/`, and verify `web/` and `api/` type-check when importing them with `import type`
- [x] 1.2 Implement `EventId` and `AttendeeId` (UUIDv7) in `api/src/Shared/Domain/ValueObject`, test-first, and verify unit tests cover valid UUIDv7, other UUID versions and malformed strings (skip if an earlier change already added them)
- [x] 1.3 Implement `Trait` (closed list of the 33 catalog traits) in the shared kernel, test-first, and verify a unit test rejects a value outside the list

## 2. Domain (unit tests first, no NestJS or ORM imports)

- [x] 2.1 Implement `Color` and `PersonalityType` (`explorer`, `connector`, `planner`, `dreamer`) and verify unit tests reject unknown values
- [x] 2.2 Implement `TraitProfile` (at least one trait, duplicates allowed) and verify a unit test rejects an empty profile
- [x] 2.3 Implement `TraitTypeMapping` (every trait mapped to exactly one type) and verify unit tests reject a missing or doubly mapped trait
- [x] 2.4 Implement `EventDistribution.open` with `Assignment` and `AssignmentCollection`, and verify a unit test shows four empty groups
- [x] 2.5 Implement `EventDistribution.assign` with candidate types from the majority of traits, and verify the "clear majority" and "repeated trait" scenarios pass as unit tests
- [x] 2.6 Add smallest-group selection, fewest-of-type selection and the amber, coral, teal, violet tie order, and verify the "color order", "smallest groups", "lacking type", "tied attendee" and "13 attendees" scenarios pass as unit tests
- [x] 2.7 Reject a second assignment for the same attendee without emitting anything, and record `AttendeeGrouped` on success, and verify both with unit tests

## 3. Persistence

- [x] 3.1 Add a migration for `event_distributions` and `assignments` (primary key `(event_id, attendee_id)`) and verify it applies and rolls back on a clean database
- [x] 3.2 Map the aggregate and assignments with MikroORM `EntitySchema` in `Infrastructure/Persistence/MikroOrm`, implement the repository (save, load with row lock, existence check), and verify integration tests persist and reload a distribution against real Postgres
- [x] 3.3 Implement `EventDistributionRepository.byEvent` and the single-attendee read, and verify integration tests cover all four colors present, other events excluded and unknown event or attendee
- [x] 3.4 Verify with an integration test that two concurrent `assign` calls on the same event serialize and keep group sizes within 1

## 4. Application and triggers

- [x] 4.1 Add the `TraitTypeMappingProvider` port and a provisional implementation mapping all 33 traits, and verify the provisional mapping constructs a valid `TraitTypeMapping`
- [x] 4.2 Implement `Application/ApplicationService` (`open`, `assign`, `distributionOf`, `assignmentOf`) dispatching pulled events through `EventDispatcher` only after a successful save, and wire it in `Infrastructure/ColorDistributionModule`; verify through the functional tests in section 5
- [x] 4.3 Subscribe to `EventCreated` (calls `open`, no-op if it already exists) and to `QuestionnaireCompleted` (calls `assign`, ignores already-assigned), handled synchronously, and verify through the functional flow test in 5.3

## 5. HTTP and functional coverage

- [x] 5.1 Add `GET /events/:eventId/distribution` with UUIDv7 validation at the boundary, and verify functional tests for an empty distribution, a populated one, an unknown event (404) and an invalid id (400)
- [x] 5.2 Add `GET /events/:eventId/attendees/:attendeeId/assignment`, and verify functional tests for an assigned attendee and a not-assigned attendee (200 with status pending) and an unknown event (404)
- [x] 5.3 Verify the end-to-end flow with a functional test: create an event, complete questionnaires for 5 attendees (including a duplicate completion and one after the icebreaker reveal), then check every assignment, the distribution counts and that `AttendeeGrouped` was published once per attendee
