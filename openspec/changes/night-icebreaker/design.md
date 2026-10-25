# Design

## Context

See proposal.md for the why, and `specs/night-icebreaker/spec.md` for the behaviour.

What exists in `api/` today:

- **Event**: `Event` has `create` and `toDTO`; `status` is a `readonly` `EventStatus` that already allows `revealed`. `EventCreated` is dispatched after `save` through the `InMemoryEventDispatcher`, whose subscribers run in-process, in order, inside the request (each one in its own MikroORM `RequestContext`).
- **Participation**: `submit` dispatches `QuestionnaireCompleted { forEventId, attendeeId, traits: WeightedTraitPrimitives[] }` and persists nothing. A repeated submit returns early once the attendee is grouped, so the event is normally published once per attendee.
- **Color Distribution**: stores each attendee's `color` and `personalityType`, not their traits. `ApplicationService.assignmentOf(eventId, attendeeId)` returns the assignment or `null`.
- **Catalog**: `ApplicationService.allIcebreakers()` returns `IcebreakerDTO { id, theme, text, traits }`, ordered by id (51 icebreakers, 1-3 traits each).
- Nobody keeps the room's traits, so Night Icebreaker has to collect them itself.
- `web/` already polls `GET /events/:eventId/attendees/:attendeeId/icebreaker` every 2 s with `IcebreakerSchema` (`locked` | `ready { question, why, meetingSpot, gatherEndsAt }`). In `http` mode it still uses the mock for that call.

## Goals / Non-Goals

**Goals:**
- The host can reveal from any client with one POST. The demo can be driven with `curl` until the host screen exists.
- The web's existing icebreaker contract is served unchanged, so `web/src/api/index.ts` only drops the mock override.
- Night Icebreaker is a bounded context like the others: `src/NightIcebreaker/{Domain,Application,Infrastructure}`, one `ApplicationService`, and its own tables.

**Non-Goals:**
- Realtime push. Polling covers the demo. When it comes it will be Server-Sent Events, not WebSockets: the flow only goes server → client, SSE is plain HTTP (no extra library, reconnects by itself through `EventSource`) and a NestJS `@Sse()` endpoint can push the same `locked`/`ready` shapes from the `NightIcebreakerPicked` subscriber, so nothing in this design changes.
- An AI explanation (`why`). This change defines the `IcebreakerExplainer` slot with its static implementation; Mastra comes in `ai-enrichment`.
- Host screen UI and the reveal button (`event-and-host`).
- Checking that an attendee joined: join doesn't exist yet. An attendee with no group is `locked`, not `404`.

## Decisions

### 1. `Event.reveal()` records `EventRevealed` only on the transition
`status` becomes a private mutable field. `reveal()` does nothing when the event is already revealed, and otherwise sets `revealed` and records `EventRevealed { eventId }` (in `src/Event/Domain/`, next to `EventCreated`). `ApplicationService.reveal(eventId)` loads the event (`EventNotFound` → 404), calls `reveal`, saves, dispatches, and returns `toDTO()`. The controller adds the quiz settings, as `GET` does.
*Alternative:* return `409` on a second reveal. Rejected: the model says a double tap is harmless.

### 2. Night Icebreaker collects room traits from `QuestionnaireCompleted`
A subscriber stores one row per `(eventId, attendeeId)` with the weighted traits as JSON (`room_traits` table). `insert ... on conflict do nothing` makes it idempotent, so a repeat counts once, and each insert touches only its own row, so concurrent submits never contend on one event row.
*Alternatives:* a single running total per event, which needs `SELECT FOR UPDATE` on every submit and double-counts repeats; or making Participation persist traits and expose them, which pulls Participation into this change and changes its model. Rejected both.

In the domain these rows are only read together, as a `RoomProfile` value object: the summed `TraitWeight` per `Trait` over the whole event. The repository port is `RoomTraitsRepository { add(eventId, attendeeId, WeightedTrait[]), profileOf(eventId): RoomProfile }`. The attendee rows are infrastructure detail.

### 3. `NightIcebreaker` aggregate, one per event, picked once
```
NightIcebreaker.pick(eventId, RoomProfile, IcebreakerCandidate[], pickedAt): NightIcebreaker
  - IcebreakerCandidate { IcebreakerId, IcebreakerText, Trait[] } — a local copy of the catalog DTO
  - score(candidate) = Σ room weight of the candidate's traits; highest wins, ties to the lowest id;
    an empty room scores everything 0 → lowest id
  - records NightIcebreakerPicked { eventId, icebreakerId }
fields: eventId (PK), icebreakerId, question (IcebreakerText), why (IcebreakerReason), pickedAt
gatherEndsAt() = pickedAt + 120 s     meetingSpotFor(Color) → MeetingSpot
```
The scoring lives in `RoomProfile.bestMatch(candidates)` (Tell, Don't Ask). The question text is copied in at pick time, so reads don't hit Catalog and the night's icebreaker stays fixed. Summing favours icebreakers with more traits that the room has, which is the "fits the most people" behaviour we want.
*Alternative:* the mean weight per trait. Rejected: it favours single-trait icebreakers that only fit the strongest trait.

`MeetingSpot` is a closed per-color VO in the domain (amber → "the bar", coral → "the entrance", teal → "the stage", violet → "the back corner"). It's nice-to-have, so the strings are fixed.

### 4. `why` comes from an `IcebreakerExplainer` port, called at pick time
`IcebreakerExplainer.explain(RoomProfile, candidate): IcebreakerReason`. The static implementation names the room's strongest one or two of the icebreaker's traits ("Picked for a room that leans adventurous and humorous."), or "Picked for everyone here tonight." when the room is empty. The result is stored on the aggregate, so reads stay cheap and identical for everyone. `ai-enrichment` adds a Mastra implementation with a timeout that falls back to this one.

### 5. Application service and subscribers
`NightIcebreaker/Application/ApplicationService`:
- `collect(eventId, attendeeId, traits)`: subscriber of `QuestionnaireCompleted`.
- `pick(eventId)`: subscriber of `EventRevealed`. Idempotent: it returns if a pick exists. Otherwise it loads the profile, reads candidates through the `IcebreakerCatalog` port (an adapter over Catalog's `allIcebreakers`), calls the explainer, then saves and dispatches.
- `forAttendee(eventId, attendeeId)` and `forHost(eventId)`: reads. They check that the event exists through an `EventDirectory` port (an adapter over Event's `eventOf`, 404 when it's missing). They get the attendee's color through a `GroupDirectory` port (an adapter over Color Distribution's `assignmentOf`), and return a view that is either `locked` or `ready`.

"Locked" is decided by the presence of a `NightIcebreaker` row, not by reading Event's status. The pick runs inside the reveal request, so after a successful reveal the row exists. A failed pick leaves it `locked` instead of serving `ready` with no icebreaker.

The subscribers follow `AssignOnQuestionnaireCompleted` (they `subscribe` in `onModuleInit`, inside `RequestContext.create`). `collect` and Color Distribution's assignment are independent, so the order the handlers are registered in doesn't matter.

### 6. HTTP and contracts
- `POST /events/:eventId/reveal` goes in `EventController` (Event owns the transition) and returns `EventResponse`.
- `NightIcebreakerController`: `GET /events/:eventId/attendees/:attendeeId/icebreaker` → `AttendeeIcebreakerResponse` and `GET /events/:eventId/icebreaker` → `HostIcebreakerResponse`, with ids through `UuidV7Param`.
- Types go in `contracts/nightIcebreaker.d.ts`. `gatherEndsAt` is `toISOString()`.

## Risks / Trade-offs

- [The pick subscriber throws during the reveal (for example, the catalog isn't seeded)] → the reveal runs in one transaction (`TransactionManager`) and dispatches `EventRevealed` inside it. MikroORM resolves the subscribers' EntityManager to that transaction, so the pick's writes join it. A failed pick rolls the event back to `open`: the request returns 500, and the host's next tap retries the whole reveal. This is a deliberate exception to "dispatch after a successful save" (ADR-004), limited to this subscriber, which only writes Night Icebreaker's own table.
- [Two simultaneous reveals] → the reveal loads the event with `SELECT ... FOR UPDATE`, so the second waits for the first to commit, then sees `revealed` and does nothing. `event_id` is still the primary key of `night_icebreakers` as a backstop.
- [Answers submitted while the reveal is running] → they may or may not count. Acceptable: the spec only promises answers completed before the reveal.
- [Traits stored twice (in the event payload and in Night Icebreaker)] → accepted. Each context keeps what its own rule needs, and the payload is small.

## Migration Plan

One new migration creates `room_traits (event_id, attendee_id, traits jsonb, PK(event_id, attendee_id))` and `night_icebreakers (event_id PK, icebreaker_id, question, why, picked_at)`. Run it with `pnpm migration:up` / `migration:up:test`. Rollback drops the two tables. The `events` table doesn't change.

## Open Questions

- Should there be a CLI or a `seed:demo` option that re-runs `pick` or reopens the demo event, to rehearse the reveal several times? It doesn't change this design: `pick` is already idempotent and public.
