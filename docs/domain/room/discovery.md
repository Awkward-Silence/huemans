# Discovery — Room

**Status**: Ready for Modeling
**Kind**: Read-only
**Last session**: 2026-10-10
**Feature context**: `openspec/changes/web-live-distribution` — `GET /events/:eventId/room`, polled every 2 s by the attendee's "waiting for the room" screen
**Generated with**: ddd-modeling 0.4.0-alpha

## Ubiquitous Language
| Term | Definition | Status |
|---|---|---|
| Room | The live picture of one event while attendees join and answer: how many joined, how many answered, and how many members each color group has | ✅ Confirmed |
| Joined | An attendee who entered their name for the event (`POST /join`), whether or not they finish the quiz | ✅ Confirmed |
| Answered | An attendee who submitted their answers and therefore has a group color; equals the sum of the group counts | ✅ Confirmed |
| Group count | How many attendees of the event have a given color | ✅ Confirmed |

## Aggregate Candidates
| Name | Responsibilities | Invariants | Status |
|---|---|---|---|
| — | Read-only context: no aggregate | — | ✅ Confirmed |

## Domain Action Candidates
| Name | Aggregate | Trigger | Preconditions | Invariants Enforced | Emits | Status |
|---|---|---|---|---|---|---|

## Value Object Candidates
| Name | Kind | Construction Rule | Scope | Status |
|---|---|---|---|---|
| EventId | basic (wraps string) | UUIDv7 | SK::EventId | ✅ Confirmed |
| Color | basic (wraps string) | One of amber, coral, teal, violet, with that fixed order (also the tie-break order) | → SK (today Local to Color Distribution; also used by Room and Night Icebreaker) | ⬆️ To Shared Kernel |
| GroupCountCollection | collection (of GroupCount) | Exactly one entry per Color, all four always present (zeros included), in Color order | Local | ✅ Confirmed |
| GroupCount | composite (SK::Color + AttendeeCount) | One color and how many of the event's attendees have it | Local | ✅ Confirmed |
| AttendeeCount | basic (wraps integer) | Whole number ≥ 0. Used for total, answered and each group's count | Local | ✅ Confirmed |

## Read Models
<!-- Read-only contexts. Fields reference VOs, except rule-free primitives. -->
| Name | Fields | Source (producer) | Read invariants | Status |
|---|---|---|---|---|
| RoomView | eventId: SK::EventId; total: AttendeeCount (joined); answered: AttendeeCount (sum of group counts); groups: GroupCountCollection | existence: Event (EventView); total: Participation (joined attendees); answered and groups: Color Distribution (EventDistributionView) | Only the requested event; never returned for an event the Event context does not know; `answered ≤ total` | ✅ Confirmed |

## Domain Events
| Name | Trigger | Payload | Status |
|---|---|---|---|

## Rule placement
| Rule | Lives in | Where exactly |
|---|---|---|
| All four colors present, in Color order, zeros included | domain | GroupCountCollection construction |
| A count is never negative | domain | AttendeeCount construction |
| `answered` = sum of the group counts | domain | RoomView is built from GroupCountCollection; `answered` is derived, not read separately |
| `answered ≤ total` | infrastructure | Guaranteed by the producers: an attendee joins (Participation) before being assigned (Color Distribution). The stub reports `total = answered` |
| An unknown event has no room (`404`) | domain | Event context's repository (`EventRepository.search` returns nothing); Room fails with a not-found error before reading any counts |

## Open Ambiguities
| Question | Context | Resolution |
|---|---|---|
| Where does the room read model live? | It spans Participation (`total`) and Color Distribution (`answered`, `groups`) | A new read-only Room context that composes both. Neither owner reads the other |
| Does `Color` stay Local to Color Distribution? | Room and Night Icebreaker also need the closed set and its fixed order | Move it to the shared kernel as SK::Color, with the order amber, coral, teal, violet. Applied to `shared-kernel/model.md` at `/ddd-model` |
| Who decides an event is unknown? | A missing distribution also means a missing event, but that is Color Distribution's side effect, not its job | The Event context: Room checks the event exists first, then reads the counts. Event owns event existence |
| What counts as "joined"? | `total` comes from Participation, which is not in `api/` yet | Anyone who entered a name (`POST /join`), including drop-offs mid-quiz. Until `quiz-and-answers` lands, a stub Participation port reports `total = answered` |

## Decisions
- No aggregate: Room only reads.
- No domain events: Room publishes nothing and reacts to nothing.
- Nothing persisted: the room is computed on every request from three ports, one per producer: Event (does the event exist), Color Distribution (members per color), Participation (joined count; stubbed with `total = answered` until `quiz-and-answers`).
- No Criteria: every read targets exactly one event.
- No authorization: anonymous, like the rest of the attendee API.

## Session Log
<!-- Append-only. One entry per session. -->
- **2026-10-10** — Opened for `web-live-distribution`. Decided Room is a read-only context with no aggregate, composing Color Distribution's distribution and a Participation joined-count port (stubbed until `quiz-and-answers`). "Joined" = name entered. Unknown event is decided by asking Event, not inferred from a missing distribution. Color moves to the shared kernel.
- **2026-10-10** — Closure accepted by the architect (ran `/ddd-model`). Added AttendeeCount, the three ports and the default decisions. Marked Ready for Modeling.
