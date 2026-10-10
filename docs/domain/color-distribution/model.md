# Domain Model — Color Distribution

**Version**: 1.5.0
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
1. Candidate types = the personality types with the highest summed weight in the trait profile, according to the trait-type mapping (one type normally, two or more when tied). An empty profile ties all four types, so every attendee still gets a group.
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
| EventDistributionView | eventId: SK::EventId; groups: one entry per SK::Color with members: count, personalityTypes: PersonalityTypeCollection (of SK::PersonalityType) | EventDistribution aggregate (this context) | Only assignments of the requested event; all four colors are always present, even when empty |
| AttendeeAssignmentView | eventId: SK::EventId; attendeeId: SK::AttendeeId; color: SK::Color; personalityType: SK::PersonalityType; mates: count | Assignments of this context | Only the requested attendee in the requested event. `mates` counts the other attendees with the same color in the same event, never the attendee themselves, and grows as others join. Absent while the attendee is not assigned yet |
| AttendeeReveal | everything in AttendeeAssignmentView, plus ColorExplanation (nickname, blurb, traits, reason) | AttendeeAssignmentView + the ColorExplainer port | Same as AttendeeAssignmentView; the explanation always describes the attendee's own personality type and color |

## Queries

| Repository | Accepts | Returns |
|---|---|---|
| EventDistributionRepository.byEvent | SK::EventId | EventDistributionView, or nothing for an unknown event |
| EventDistributionRepository.assignmentOf | SK::EventId, SK::AttendeeId | AttendeeAssignmentView, or nothing while the attendee is not assigned |

Both reads target one event (and one attendee), so no SK::Criteria is needed. Reading an attendee's assignment in an unknown event fails with EventDistributionNotFound instead of returning nothing, so the caller can tell "not assigned yet" (keep polling) from "no such event".

## Ports

| Port | Operation | Returns | Implementations |
|---|---|---|---|
| TraitTypeMappingProvider | mapping() | TraitTypeMapping | Provisional static table until the catalog lane ships `CatalogTraitTypeMappingProvider` |
| ColorExplainer | explain(AttendeeAssignmentView assignment) | ColorExplanation | `StaticColorExplainer`: copy from Catalog's PersonalityTypeProfile, plus a fixed reason sentence. The AI agent plugs in later behind the same port |

**ColorExplanation:** the reveal copy for one assignment.
- `nickname` and `blurb` describe the attendee's personality type, not the color, because groups are mixed on purpose.
- `traits` are the type's 3 SK::Trait chips.
- `reason` says why the attendee's group fits their type.

All four fields are presentation copy and carry no rule. The explainer enriches the reveal and never decides anything: it gets an assignment that is already final, and the static implementation is the fallback, so the reveal never waits on an LLM.

---

## Value Objects

| Name | Kind | Base / Components | Construction Rule | Invalid States | Scope |
|---|---|---|---|---|---|
| Color | basic | string | One of amber, coral, teal, violet, in that fixed order | any other value | SK::Color |
| PersonalityType | basic | string | One of exactly 4 personality types | any value outside the 4 types | SK::PersonalityType |
| TraitProfile | collection | SK::WeightedTrait | May be empty; no maximum; duplicates allowed, each occurrence adds its weight | — | Local |
| TraitTypeMapping | collection | SK::Trait to SK::PersonalityType pairs | Every one of the 33 traits is mapped to exactly one personality type | a trait missing or mapped twice | Local |
| AssignmentCollection | collection | Assignment | No two assignments for the same SK::AttendeeId | duplicate SK::AttendeeId | Local |
| PersonalityTypeCollection | collection | SK::PersonalityType | Duplicates allowed (one entry per group member) | — | Local |

### TraitProfile — Detail

**Construction rule:** built from the weighted traits Participation hands over for one attendee. It may be empty (nothing pointed to a trait). The same trait may appear several times, and each occurrence adds its weight to that trait's personality type. Participation weighs each multiple-choice answer 1 and the "I ..." sentence 1 in total, spread over its traits (ADR-012). Whether the questionnaire was complete is not checked here.
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
| AttendeeGrouped | An attendee receives their group color and personality type | EventDistribution | eventId: SK::EventId, attendeeId: SK::AttendeeId, color: SK::Color, personalityType: SK::PersonalityType | Active |

---

## Shared Kernel References

| SK Type | Used by | Reason |
|---|---|---|
| SK::EventId | EventDistribution, EventDistributionView, AttendeeGrouped | Issued by the Event context and referenced by Participation, Color Distribution and icebreaker selection; one definition (UUIDv7) |
| SK::AttendeeId | Assignment, AttendeeGrouped | Issued by Participation and referenced by Color Distribution; one definition (UUIDv7) |
| SK::Trait | TraitProfile, TraitTypeMapping | The closed list of 33 traits is used by Catalog (answers, icebreakers), Participation (trait profiles), Color Distribution (personality types) and icebreaker selection, so it is defined once |
| SK::PersonalityType | Assignment, TraitTypeMapping, PersonalityTypeCollection, AttendeeGrouped, EventDistributionView | A closed set of 4. Catalog keys the profiles and the trait-type mapping by it; this context assigns it and balances groups with it. It was Local here until the Catalog model moved it to the shared kernel |
| SK::Color | Assignment, AttendeeGrouped, EventDistributionView, AttendeeAssignmentView | The four group colors and their fixed order. This context assigns them and breaks ties with the order; Room and Night Icebreaker read them too. It was Local here until the Room model moved it to the shared kernel |

---

## Ubiquitous Language

| Term | Definition |
|---|---|
| Trait profile | The weighted traits an attendee's answers point to, built by Participation and handed to this context; may be empty |
| Color | One of the four groups an attendee can belong to (amber, coral, teal, violet). A group label, not a personality type |
| Diversity | How different the personalities inside one group are; assignment maximizes it |
| Personality type | One of 4 types derived from an attendee's trait profile; shown at the reveal and used to balance groups |
| Trait-type mapping | The table placing each of the 33 traits in exactly one personality type |
| Tied attendee | An attendee whose traits point equally to two or more personality types; the tie resolves to the type their group lacks |
| Assignment | The final group color and personality type given to one attendee; never changes |
| Mates | The other attendees who share an attendee's color in the same event |
| Reveal | The moment the attendee's phone shows their color and personality type, with the copy that explains it |
| Distribution | The current state of an event's groups: per color, how many members and which personality types they hold |

---

## Open Questions

- The content of the trait-type mapping is still provisional, until the catalog lane seeds it (see `docs/domain/catalog/model.md`). The names and descriptions of the 4 personality types are Catalog's PersonalityTypeProfile. Neither changes this model.
