# Discovery — Color Distribution

**Status**: Ready for Modeling
**Kind**: Read-write
**Last session**: 2026-10-09
**Feature context**: OpenSpec change `color-distribution` (openspec/changes/color-distribution/proposal.md)
**Generated with**: ddd-modeling 0.4.0-alpha

## Ubiquitous Language
| Term | Definition | Status |
|---|---|---|
| Trait profile | The traits an attendee's answers point to, built by Participation and handed to this context as input; at least one trait | ✅ Confirmed |
| Color | One of the four groups an attendee can belong to (RED, YELLOW, GREEN, BLUE). A group label, not a personality type | ✅ Confirmed |
| Diversity | How different the personalities inside one group are; the goal is to maximize it so groups mix different people | ✅ Confirmed |
| Personality type | One of a small fixed set of types (e.g. explorer, connector, planner, dreamer) derived from an attendee's trait profile; shown at the reveal and used to balance groups | ✅ Confirmed |
| Affinity | How strongly an attendee's trait profile leans towards each color, derived from trait weights | ❌ Rejected: colors are not assigned by similarity to the color |
| Trait weight | How much a given trait counts towards a given personality type (catalog data) | ❌ Rejected: each trait belongs to exactly one personality type (see Trait-type mapping) |
| Trait-type mapping | The table that places each of the 33 traits in exactly one of the 4 personality types | ✅ Confirmed |
| Tied attendee | An attendee whose answers point equally to two or more personality types; the tie is resolved in favor of the type their group is missing | ✅ Confirmed |
| Assignment | The final group color and personality type given to one attendee; never changes after it is made | ✅ Confirmed |
| Capacity | The maximum size a color group may reach | ❌ Rejected: replaced by the even-sizes rule (group sizes never differ by more than 1) |
| Distribution | The current state of an event's groups: per color, how many members and which personality types they hold | ✅ Confirmed |

## Aggregate Candidates
| Name | Responsibilities | Invariants | Status |
|---|---|---|---|
| EventDistribution | One per event. Holds every assignment made in the event and the resulting counts per color; assigns new attendees | An attendee is assigned at most once; an assignment (color and personality type) never changes; group sizes never differ by more than 1 | ✅ Confirmed |

## Domain Action Candidates
| Name | Aggregate | Trigger | Preconditions | Invariants Enforced | Emits | Status |
|---|---|---|---|---|---|---|
| assign | EventDistribution | Participation reports a completed questionnaire with the attendee's trait profile | Attendee not yet assigned in this event | Assigned at most once; assignment never changes; sizes differ by at most 1. Rule: candidate types = types with most traits; candidate groups = smallest groups; pick the (group, type) pair whose group has the fewest members of that type; remaining ties broken by fixed color order | AttendeeGrouped | ✅ Confirmed |

## Value Object Candidates
| Name | Kind | Construction Rule | Scope | Status |
|---|---|---|---|---|
| Trait | basic (wraps string) | One of the 33 catalog traits (closed list, today `tools/src/questions/Traits.ts`) | ⬆️ SK::Trait | ⬆️ To Shared Kernel |
| TraitProfile | collection (of SK::Trait) | At least 1 trait; no maximum; duplicates allowed (each occurrence counts as a vote). Completeness of the questionnaire is Participation's concern | Local | ✅ Confirmed |
| Color | basic (wraps string) | One of RED, YELLOW, GREEN, BLUE | Local | 🔍 Candidate |
| EventId | basic (wraps string) | Identifies the event this distribution belongs to; issued by the Event context | Local (possible SK candidate) | 🔍 Candidate (derived from AttendeeGrouped payload) |
| AttendeeId | basic (wraps string) | Identifies an attendee; issued by Participation | Local (possible SK candidate) | 🔍 Candidate (derived from AttendeeGrouped payload) |
| PersonalityType | basic (wraps string) | One of exactly 4 types (names to be confirmed, e.g. explorer, connector, planner, dreamer) | Local | ✅ Confirmed |

## Read Models
| Name | Fields | Source (producer) | Read invariants | Status |
|---|---|---|---|---|
| EventDistributionView | eventId; per Color: member count, PersonalityType of each member | EventDistribution aggregate (this context) | Only assignments of the requested event; all four colors always present, even when empty | ✅ Confirmed |

## Domain Events
| Name | Trigger | Payload | Status |
|---|---|---|---|
| AttendeeGrouped | An attendee receives their color | eventId, attendeeId, color, personalityType | ✅ Confirmed |

## Rule placement
| Rule | Lives in | Where exactly |
|---|---|---|
| Answers are translated into traits | domain | Participation context, not this one |
| A trait profile has at least one trait | domain | TraitProfile construction |
| Whether the questionnaire is complete enough to be distributed | domain | Participation context (decides when to publish QuestionnaireCompleted) |
| Group sizes are checked against all assignments of the event atomically | domain | EventDistribution aggregate |
| Remaining ties are broken by fixed color order (deterministic, testable, repeatable bot seeding) | domain | EventDistribution.assign |
| Personality type = the type with the most traits in the profile; ties resolved towards the type the chosen group lacks | domain | EventDistribution.assign, using the trait-type mapping |

## Open Ambiguities
| Question | Context | Resolution |
|---|---|---|
| Who owns the trait profile? | Participation could hand over raw answers or a ready-made profile | Participation builds it; Color Distribution receives it (2026-10-09) |
| Aggregate per event or per attendee? | Capacity depends on every other assignment in the event | One aggregate per event (EventDistribution), so capacity is enforced in one consistency boundary (2026-10-09) |
| Are groups formed by similarity or by difference? | The raw spec's example ("50% red, 50% blue") implies colors match personality | By difference: each group mixes different personalities, with even sizes. Four introverts or four Julio Iglesias fans in one group defeat the purpose (2026-10-09) |
| How is the personality type derived from traits? | Weighted 33 x 4 table vs each trait in one type | Each trait belongs to exactly one of 4 types; type = majority; ties go to the type that adds diversity to the group (2026-10-09) |
| Is Trait shared across contexts? | Used by Catalog, Participation, Distribution and icebreaker selection | Yes: Trait moves to the shared kernel as SK::Trait; TraitProfile stays local (2026-10-09) |
| What are the names and descriptions of the 4 personality types, and which traits go in each? | Content, not structure; needed by the trait-type mapping and the reveal screen | 🕓 Deferred: content decision for the catalog lane, does not change the model |
| What does the color reveal tell the attendee, if the color is not their personality? | The raw spec says the reveal shows "a short description of the color" | Both: the group color and the attendee's personality type, with its description. Diversity is balanced on personality type: each group aims for a mix of types (2026-10-09) |

## Session Log
<!-- Append-only. One entry per session. -->
- **2026-10-09**: Session opened. Confirmed that Color Distribution receives the trait profile from Participation. Seeded language candidates from the `color-distribution` proposal. Confirmed EventDistribution (one per event) as the aggregate root. Reframed distribution: groups are built for diversity (different personalities together, even sizes), not affinity; Affinity rejected. The reveal shows group color + personality type, and groups balance personality types. 4 personality types; each trait maps to exactly one type; ties resolved towards diversity. Confirmed the full assign rule and its three invariants. Trait approved for the shared kernel (SK::Trait); TraitProfile stays local: at least 1 trait, no max, duplicates count as votes. Live distribution read model shows counts and personality types per color. Architect moved to /ddd-model: status set to Ready for Modeling, AttendeeGrouped payload confirmed. EventId and AttendeeId added as candidate VOs (required by the primitive rule). This contradicts the raw spec example and the current proposal, which will need updating.
