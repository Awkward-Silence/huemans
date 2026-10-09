# Design

## Context

There is no application code yet: `api/` is created by `backend-skeleton-and-catalog` (NestJS, Postgres, Unit/Integration/Functional suites). The domain contract is `docs/domain/color-distribution/model.md` (aggregate `EventDistribution`, entity `Assignment`, actions `open` and `assign`, event `AttendeeGrouped`, read model `EventDistributionView`) and `docs/domain/shared-kernel/model.md` (`Trait`, `EventId`, `AttendeeId`). Code uses those names. Requirements are in `specs/color-distribution/spec.md`; motivation in `proposal.md`.

Two inputs come from other lanes and are not built here: `EventCreated` (Event context) and `QuestionnaireCompleted` with the trait profile (Participation, `event-join-and-answers`), plus the trait-type mapping content (catalog).

## Goals / Non-Goals

**Goals:**
- A pure, fully unit-tested domain for the assign rule, independent of NestJS and the ORM.
- Correct assignment under concurrent submissions within one event.
- Assignment completes before the questionnaire submit returns, so the reveal never has to wait.

**Non-Goals:**
- Realtime delivery over WebSockets (the gateway belongs to the realtime spike / `event-and-host`; it subscribes to `AttendeeGrouped`).
- Names, descriptions and the trait-type table content of the personality types (catalog lane).
- AI explanations of the color (`ai-enrichment`).

## Decisions

**Module layout.** Follows `api-skeleton`: `api/src/ColorDistribution/{Domain,Application,Infrastructure}`, with ports in `Domain/Port`, value objects in `Domain/ValueObject`, the Nest module at `Infrastructure/ColorDistributionModule.ts`, and the shared-kernel types `Trait`, `EventId`, `AttendeeId` in `api/src/Shared/Domain/ValueObject`. `Domain/` imports nothing from NestJS or the ORM (enforced by lint); MikroORM `EntitySchema` mapping lives in `Infrastructure/Persistence/MikroOrm`. Alternative — decorators on domain classes — rejected: it ties the core domain to the ORM.

**One application service, no buses.** `ApplicationService` (in `Application/`) exposes `open(eventId)`, `assign(eventId, attendeeId, traits)`, `distributionOf(eventId)` and `assignmentOf(eventId, attendeeId)`. Each write loads the aggregate, calls the domain method, saves, then dispatches the pulled domain events. Controllers and event subscribers call it directly.

**In-process, synchronous triggers.** Subscribers to `EventCreated` and `QuestionnaireCompleted` (the shared synchronous `EventDispatcher`) call `open` and `assign`. Synchronous handling means the submit request returns only after the attendee is assigned, so the suspense CTA always finds an assignment. Alternative — a message queue — rejected: one Node process, no cross-service fan-out, and it would add a "pending" state to the reveal.

**Concurrency: lock the event's distribution row.** `assign` runs in one transaction that loads the distribution with `SELECT ... FOR UPDATE` on the `event_distributions` row, so two attendees finishing at once are serialized per event. With 15-50 attendees per event, contention is negligible. Alternative — optimistic locking with a version column and retry — works too but needs retry code for no real gain at this scale. A unique key on `(event_id, attendee_id)` backs the "assigned at most once" invariant at the database level.

**Duplicates are not errors to the caller.** `EventDistribution.assign` rejects an attendee who is already assigned with a domain error and emits nothing; the `QuestionnaireCompleted` subscriber treats that error as already handled. `open` for an event that already has a distribution is likewise a no-op (the repository checks existence; the primary key protects it).

**Mapping is passed in.** The application service loads the `TraitTypeMapping` from the catalog through a port (`Domain/Port/TraitTypeMappingProvider`) and passes it to `assign`. Until the catalog lane delivers the real table, an infrastructure implementation returns a provisional mapping covering all 33 traits. Unit tests build small mappings of their own.

**Provisional personality types.** `PersonalityType` is a closed set of 4 codes: `explorer`, `connector`, `planner`, `dreamer` (the examples from discovery). The catalog lane may rename them; that is a change to the value object's allowed values and the provisional mapping, not to the rule.

**Persistence.** Tables `event_distributions(event_id PK)` and `assignments(event_id, attendee_id, color, personality_type, assigned_at, PK(event_id, attendee_id))`. The aggregate is rebuilt from its assignments; group counts are derived, never stored.

**Reads.** `EventDistributionRepository.byEvent(eventId)` builds `EventDistributionView` with one grouped query and fills in missing colors with zero; it returns nothing for an unknown event (HTTP 404). The attendee assignment is a single-row read (HTTP 404 with a "not assigned" body when missing, so the client can tell it apart from an unknown route).

**HTTP.** `GET /events/:eventId/distribution` and `GET /events/:eventId/attendees/:attendeeId/assignment`. Path ids are validated as UUIDv7 at the boundary (400 otherwise). Response shapes go into `contracts/`, together with the `AttendeeGrouped` payload.

**Tests (TDD, outside-in).** Functional: the two endpoints and the event-driven flow (event created, then questionnaires completed, then distribution and assignment reads) against the real app. Unit: `EventDistribution` (every spec scenario of the assign rule), `TraitProfile`, `TraitTypeMapping`, `Color`, `PersonalityType`, shared-kernel VOs. Integration: the repository against real Postgres, including the concurrent-assign case. No unit tests for the application service.

## Risks / Trade-offs

- [Participation still publishes raw answers per its current proposal] → Align the `QuestionnaireCompleted` contract at kickoff; until then the subscriber is tested with the trait-profile shape from `contracts/`.
- [Catalog delivers no mapping in time] → The provisional mapping keeps the flow working; swapping it is a data change.
- [A missed `EventCreated` leaves an event without a distribution] → `assign` on an event with no distribution fails loudly in logs; the demo creates events through the same app, so the path is covered by the functional test.
- [Synchronous assignment lengthens the submit request] → One locked row and one insert per submit; no LLM or network call is involved.
- [Provisional type names leak into contracts] → Contracts expose the type as a string code; renaming is coordinated with the frontend in one place.
