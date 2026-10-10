# Domain Model — Room

**Version**: 1.0.0
**Status**: Draft
**Date**: 2026-10-10
**Kind**: Read-only
**Source**: discovery.md session 2026-10-10
**Generated with**: ddd-modeling 0.4.0-alpha

---

## Bounded Context

Room gives the live picture of one event while attendees join and answer: how many joined, how many answered, and how many members each color group has. Attendee phones poll it on the "waiting for the room" screen. It owns no state. It composes what three other contexts already know: Event (whether the event exists), Color Distribution (members per color) and Participation (who joined).

It is NOT responsible for:
- deciding whether an event exists (Event), assigning colors (Color Distribution), or recording joins and answers (Participation);
- which personality types sit in each group (that stays in Color Distribution's distribution, for the host screen);
- the night's icebreaker (Night Icebreaker) or realtime push (polling stays).

## Aggregates

None — read-only context. Event, Color Distribution and Participation produce the data; Room reads it on every request and stores nothing.

---

## Read Models

Immutable DTOs with no behaviour. Fields reference VOs, except rule-free
primitives (free text, opaque payloads).

| Name | Fields | Source | Read invariants |
|---|---|---|---|
| RoomView | eventId: SK::EventId; total: AttendeeCount; answered: AttendeeCount; groups: GroupCountCollection | existence: Event; groups: Color Distribution; total: Participation. `answered` is the sum of the group counts | Only the requested event. Never returned for an event Event does not know. All four colors present, in SK::Color order, zeros included. `answered ≤ total` |

`answered` is derived from `groups`, not read from a producer: an attendee who answered is assigned in the same request, so the two can never disagree.

## Queries

| Repository | Accepts | Returns |
|---|---|---|
| EventLookup.exists | SK::EventId | whether Event knows the event |
| GroupCounter.countsOf | SK::EventId | GroupCountCollection |
| JoinedAttendeeCounter.joinedIn | SK::EventId | AttendeeCount |

Every read targets exactly one event, so no SK::Criteria is needed. These are ports owned by Room; each producer's infrastructure implements one:

| Port | Implemented over | Notes |
|---|---|---|
| EventLookup | Event's EventRepository.search | Checked first. Unknown event → RoomNotFound (`404`) before any count is read |
| GroupCounter | Color Distribution's EventDistributionView | Members per color only; the personality types stay in Color Distribution |
| JoinedAttendeeCounter | Participation's joined attendees | Stub until `quiz-and-answers` lands: reports the same number as `answered`, so the room shows everyone as answered |

---

## Value Objects

| Name | Kind | Base / Components | Construction Rule | Invalid States | Scope |
|---|---|---|---|---|---|
| EventId | basic | string | UUIDv7 | not a valid UUIDv7 | SK::EventId |
| Color | basic | string | One of amber, coral, teal, violet, in that fixed order | any other value | SK::Color |
| AttendeeCount | basic | integer | Whole number ≥ 0 | negative; not a whole number | Local |
| GroupCount | composite | SK::Color + AttendeeCount | One color and how many of the event's attendees have it | — | Local |
| GroupCountCollection | collection | GroupCount | Exactly one entry per SK::Color, all four always present (zeros included), in SK::Color order | a color missing or repeated | Local |

### GroupCountCollection — Detail

**Construction rule:** built from the counts Color Distribution reports for one event. Every SK::Color appears exactly once, ordered amber, coral, teal, violet; a color with no members appears with a count of 0. The sum of its counts is the room's `answered`.
**Immutable:** yes
**Equality:** by value

---

## Domain Events

None — Room publishes no events and reacts to none.

---

## Shared Kernel References

| SK Type | Used by | Reason |
|---|---|---|
| SK::EventId | RoomView, all three ports | Every context that refers to an event uses the id Event issues |
| SK::Color | GroupCount, GroupCountCollection | The closed set of four colors and its fixed order is used by Color Distribution (assignment, tie-break), Room (group counts) and Night Icebreaker (meeting spot per color). Moved from Color Distribution to the shared kernel in this session |

---

## Ubiquitous Language

| Term | Definition |
|---|---|
| Room | The live picture of one event: how many joined, how many answered, and how many members each color group has |
| Joined | An attendee who entered their name for the event, whether or not they finish the quiz |
| Answered | An attendee who submitted their answers and therefore has a group color; the sum of the group counts |
| Group count | How many attendees of the event have a given color |

---

## Open Questions

- Color Distribution's model still lists `Color` as Local. It has to reference SK::Color instead (a separate edit to that model), and in code `Color` moves to `api/src/Shared/Domain/ValueObject/`.
- JoinedAttendeeCounter is a stub until Participation exists; `quiz-and-answers` provides the real implementation.
