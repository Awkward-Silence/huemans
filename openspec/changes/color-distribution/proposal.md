# Proposal

## Why

Assigning everyone a color is the core of huemans and the moment the demo builds suspense towards. The color has to reflect the attendee's answers while keeping the four groups roughly equal in size. Otherwise one huge group and three tiny ones defeat the purpose of mixing people.

## What Changes

- Compute an attendee's affinity to each of the four colors from their trait profile and the catalog's trait weights.
- Assign the color with a bias towards equal distribution: take the attendee's best color unless it is over capacity (about a quarter of the event's attendees plus some slack), and in that case take the next best one. For example, someone who is 50% RED and 50% BLUE goes to BLUE when there are already too many REDs.
- Assignment is online and final. Each attendee is assigned once, as soon as they finish answering, and is never re-balanced after the reveal.
- Reveal endpoint: the attendee taps the suspense CTA and gets their color, the color's short description, and their per-color scores.
- Expose live distribution counts per event, and push `AttendeeGrouped` in realtime so the progress/distribution screen and the host screen update.

## Capabilities

### New Capabilities
- `color-distribution`: trait-to-color scoring, balanced assignment, the color reveal, and live distribution counts.

### Modified Capabilities

## Impact

- Core domain of `api/`, modeled with DDD (`/ddd-bc`, `/ddd-model` output under `docs/domain/`) and fully unit-tested.
- Consumes `QuestionnaireCompleted`, publishes `AttendeeGrouped { eventId, attendeeId, color }`. Both go into `contracts/`.
- Depends on `backend-skeleton-and-catalog` (trait weights) and `event-join-and-answers` (trait profiles).
- Owner: Adrián.
