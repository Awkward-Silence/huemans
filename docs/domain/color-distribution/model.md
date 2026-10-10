# Domain Model — Color Distribution

**Version**: 1.2.0
**Status**: Draft
**Date**: 2026-10-10
**Kind**: Read-write
**Source**: discovery.md session 2026-10-10
**Generated with**: ddd-modeling 0.4.0-alpha

---

## Bounded Context

Color Distribution splits the attendees of an event into four color groups built for **diversity**. Each group mixes different personality types, and group sizes stay even. It receives each attendee's trait profile, derives the attendee's personality type from it with the trait-type mapping, and makes a final assignment of a group color and a personality type. It exposes the live distribution of the event (members and personality types per color).

It is NOT responsible for:
- turning answers into traits, or deciding when a questionnaire is complete (Participation);
- the content of questions, icebreakers, or the names and descriptions of personality types (Catalog);
- selecting the night's icebreaker, or the event's status: revealing the icebreaker does not affect the distribution, and late joiners are still assigned.

## Aggregates

| Aggregate Root | Responsibilities | Invariants |
|---|---|---|
| EventDistribution | One per event. Holds every assignment made in the event and assigns new attendees to a group color and personality type | An attendee is assigned at most once; an assignment never changes; group sizes never differ by more than 1 |

### EventDistribution — Detail

**Entities within this aggregate:**
- Assignment — one attendee's final group color and personality type, identified by SK::AttendeeId within the event

**Invariants:**
- An attendee is assigned at most once in an event.
- An assignment (color and personality type) never changes once made.
- The sizes of the four color groups never differ by more than 1.

**Lifecycle events:**
- AttendeeGrouped — triggered when an attendee receives their group color and personality type

**Domain actions:**

| Action | Preconditions | Invariants enforced | Emits |
|---|---|---|---|
| open(SK::EventId eventId) | No distribution exists yet for this event | Starts with all four colors present and empty | — |
| assign(SK::AttendeeId attendeeId, TraitProfile traitProfile, TraitTypeMapping mapping) | The attendee has no assignment in this event | At most one assignment per attendee; assignments never change; group sizes differ by at most 1 | AttendeeGrouped |

`open` creates the aggregate in reaction to EventCreated from the Event context, so the distribution exists with four empty groups before the first attendee answers.

There is no withdraw action (an attendee who leaves still counts in their group, so sizes never differ by more than 1 at any time) and no close action (the reveal of the night's icebreaker does not stop assignment). The attendee's color reveal is a read of their assignment, not an action.

The trait-type mapping is passed in by the caller: the catalog owns the table's contents, and the domain owns the rule that uses it.

**assign rule:**
1. Candidate types = the personality types with the most traits in the trait profile, according to the trait-type mapping (one type normally, two or more when tied).
2. Candidate groups = the colors with the fewest members.
3. For each (group, type) pair, score = members of that group who already have that type.
4. Pick the pair with the lowest score. This places the attendee where they add the most diversity, and resolves ties between types in favor of the type the group lacks.
5. Remaining ties are broken by the fixed color order amber, coral, teal, violet, the same for every event, so assignment is deterministic and repeatable.
6. Record the Assignment and emit AttendeeGrouped.

---

## Read Models

Immutable DTOs with no behaviour. Fields reference VOs, except rule-free
primitives (free text, opaque payloads).

| Name | Fields | Source | Read invariants |
|---|---|---|---|
| EventDistributionView | eventId: SK::EventId; groups: one entry per Color with members: count, personalityTypes: PersonalityTypeCollection | EventDistribution aggregate (this context) | Only assignments of the requested event; all four colors are always present, even when empty |

## Queries

| Repository | Accepts | Returns |
|---|---|---|
| EventDistributionRepository | SK::EventId | EventDistributionView |

The live distribution is always read for one event, so no SK::Criteria is needed.

---

## Value Objects

| Name | Kind | Base / Components | Construction Rule | Invalid States | Scope |
|---|---|---|---|---|---|
| Color | basic | string | One of amber, coral, teal, violet | any other value | Local |
| PersonalityType | basic | string | One of exactly 4 personality types | any value outside the 4 types | Local |
| TraitProfile | collection | SK::Trait | At least 1 trait; no maximum; duplicates allowed, each occurrence counts as a vote | empty | Local |
| TraitTypeMapping | collection | SK::Trait to PersonalityType pairs | Every one of the 33 traits is mapped to exactly one personality type | a trait missing or mapped twice | Local |
| AssignmentCollection | collection | Assignment | No two assignments for the same SK::AttendeeId | duplicate SK::AttendeeId | Local |
| PersonalityTypeCollection | collection | PersonalityType | Duplicates allowed (one entry per group member) | — | Local |

### TraitProfile — Detail

**Construction rule:** built from the traits Participation hands over for one attendee. Must hold at least one SK::Trait. The same trait may appear several times, and each occurrence is one vote for that trait's personality type. Whether the questionnaire was complete is not checked here.
**Immutable:** yes
**Equality:** by value

### TraitTypeMapping — Detail

**Construction rule:** places each SK::Trait in exactly one of the 4 personality types. Built from catalog content by the application service and passed into `assign`. The actual table (which traits go in which type) is deferred to the catalog lane.
**Immutable:** yes
**Equality:** by value

---

## Domain Events

| Event | Trigger | Aggregate | Payload | Status |
|---|---|---|---|---|
| AttendeeGrouped | An attendee receives their group color and personality type | EventDistribution | eventId: SK::EventId, attendeeId: SK::AttendeeId, color: Color, personalityType: PersonalityType | Active |

---

## Shared Kernel References

| SK Type | Used by | Reason |
|---|---|---|
| SK::EventId | EventDistribution, EventDistributionView, AttendeeGrouped | Issued by the Event context and referenced by Participation, Color Distribution and icebreaker selection; one definition (UUIDv7) |
| SK::AttendeeId | Assignment, AttendeeGrouped | Issued by Participation and referenced by Color Distribution; one definition (UUIDv7) |
| SK::Trait | TraitProfile, TraitTypeMapping | The closed list of 33 traits is used by Catalog (answers, icebreakers), Participation (trait profiles), Color Distribution (personality types) and icebreaker selection, so it is defined once |

---

## Ubiquitous Language

| Term | Definition |
|---|---|
| Trait profile | The traits an attendee's answers point to, built by Participation and handed to this context; at least one trait |
| Color | One of the four groups an attendee can belong to (amber, coral, teal, violet). A group label, not a personality type |
| Diversity | How different the personalities inside one group are; assignment maximizes it |
| Personality type | One of 4 types derived from an attendee's trait profile; shown at the reveal and used to balance groups |
| Trait-type mapping | The table placing each of the 33 traits in exactly one personality type |
| Tied attendee | An attendee whose traits point equally to two or more personality types; the tie resolves to the type their group lacks |
| Assignment | The final group color and personality type given to one attendee; never changes |
| Distribution | The current state of an event's groups: per color, how many members and which personality types they hold |

---

## Open Questions

- Names and descriptions of the 4 personality types, and the content of the trait-type mapping (deferred to the catalog lane; does not change the model).
- The attendee's color reveal reads their own assignment (color and personality type). Discovery only defined EventDistributionView (per color); a per-attendee read model was not discussed.
