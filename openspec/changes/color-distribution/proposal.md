# Proposal

## Why

Splitting attendees into color groups is the core of huemans: it is what turns a room of strangers into small teams with a reason to talk. Groups must **mix different personalities** — four introverts, or four Julio Iglesias fans, in one group defeat the purpose — and stay even in size. The domain was modeled for this in `docs/domain/color-distribution/model.md`; this change makes it real and replaces the earlier affinity-based idea (colors matching personalities), which the team rejected.

## What Changes

- Open a distribution for every new event, with all four color groups (RED, YELLOW, GREEN, BLUE) present and empty, so the live distribution screen works before anyone answers.
- Derive each attendee's **personality type** (one of 4) from the trait profile Participation hands over: the type most of their traits map to, using the catalog's trait-type mapping.
- Assign each attendee once, finally, to a group built for diversity: among the smallest groups, the one with the fewest members of the attendee's type. An attendee tied between types takes the type their group lacks. Remaining ties go in the order RED, YELLOW, GREEN, BLUE.
- Publish `AttendeeGrouped { eventId, attendeeId, color, personalityType }` after each assignment, for realtime delivery to the phone and host screen.
- Expose the live distribution of an event: per color, the member count and the personality types present.
- Expose an attendee's own assignment (color and personality type) for the reveal screen, so it survives a reload or a missed push.
- Keep assigning late joiners after the night's icebreaker is revealed.
- **BREAKING** (against the earlier draft of this proposal): no color affinity, no trait-to-color weights, no capacity slack. Colors are group labels, not personalities.

## Capabilities

### New Capabilities
- `color-distribution`: opening an event's distribution, deriving personality types, diversity-based balanced assignment, the AttendeeGrouped event, the live distribution view and the per-attendee assignment lookup.

### Modified Capabilities

## Impact

- New `color-distribution` module in `api/`, built with DDD (pure `domain/` layer, unit-tested) plus persistence and HTTP endpoints.
- Introduces the shared-kernel types `Trait`, `EventId` and `AttendeeId` in `api/` if no earlier change has.
- Consumes `EventCreated` (Event context) and `QuestionnaireCompleted` with the attendee's trait profile (Participation). The `event-join-and-answers` proposal currently publishes raw answers; it must publish the trait profile instead.
- Needs the trait-type mapping from the catalog. The `backend-skeleton-and-catalog` proposal still describes "colors with trait weights"; it must provide 4 personality types and a trait-to-type mapping instead.
- Adds `AttendeeGrouped`, the distribution view and the attendee assignment response to `contracts/`.
- Depends on `backend-skeleton-and-catalog` (NestJS, Postgres, test suites). Owner: Adrián.
