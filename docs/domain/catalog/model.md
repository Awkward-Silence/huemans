# Domain Model — Catalog

**Version**: 1.0.0
**Status**: Draft
**Date**: 2026-10-10
**Kind**: Read-only
**Source**: discovery.md session 2026-10-10
**Generated with**: ddd-modeling 0.4.0-alpha

---

## Bounded Context

Catalog holds the fixed game content: the questions with their trait-tagged answers, the icebreakers, the personality type profiles shown at the reveal, and the trait-type mapping. The content is authored as JSON in `tools/` and seeded into Postgres. During an event it is only read, and it is never changed. Catalog serves full lists and lookups by key.

Catalog is NOT responsible for:
- choosing which questions an event asks (Participation);
- choosing the night's icebreaker (Night icebreaker);
- deriving an attendee's personality type or group (Color Distribution, which owns the rule that uses the trait-type mapping);
- writing the reveal sentence for an assignment (Color Distribution's `ColorExplainer` port, which reads profiles from here).

## Aggregates

None — read-only context. The content is produced by the seed command from the `tools/` JSON files and lives in Postgres.

## Read Models

Immutable DTOs with no behaviour. Fields reference VOs, except rule-free
primitives (free text, opaque payloads).

| Name | Fields | Source | Read invariants |
|---|---|---|---|
| Question | id: QuestionId; theme: Theme; text: string (rule-free); answers: AnswerCollection | Seed from `tools/` questions JSON, stored in Postgres | — |
| Icebreaker | id: IcebreakerId; theme: Theme; text: string (rule-free); traits: IcebreakerTraitCollection | Seed from `tools/` icebreakers JSON, stored in Postgres | — |
| PersonalityTypeProfile | type: SK::PersonalityType; nickname: string (rule-free); blurb: string (rule-free); traits: ProfileTraitCollection | Seed from `tools/` personality types JSON (new), stored in Postgres | Exactly one profile per SK::PersonalityType (4 in total) |
| TraitTypeMapping | pairs: SK::Trait → SK::PersonalityType | Seed from `tools/` trait-type mapping JSON (new), stored in Postgres | Every one of the 33 traits appears exactly once |

An answer's `text` is also rule-free free text. `text` fields are non-empty, and the seed checks that.

## Queries

Simple named reads. Catalog takes no Criteria: each consuming context makes its own selection from the full lists.

| Repository | Accepts | Returns |
|---|---|---|
| CatalogRepository.allQuestions | — | every Question |
| CatalogRepository.allIcebreakers | — | every Icebreaker |
| CatalogRepository.profileOf | SK::PersonalityType | PersonalityTypeProfile |
| CatalogRepository.mapping | — | TraitTypeMapping |

### Rule placement

| Rule | Lives in | Where exactly |
|---|---|---|
| Catalog JSON is valid before it is stored | boundary | The seed command validates the `tools/` JSON with the api's own schema |
| Each profile trait is mapped to the profile's type | boundary | The seed command (and `tools/` validate) cross-checks the profiles JSON against the mapping JSON. Content is read-only, so the seed is the only place this can break |
| Which questions or icebreaker an event uses | domain (consumer) | Participation picks questions; Night icebreaker picks the icebreaker |
| Reveal copy for an assignment | infrastructure (consumer) | Color Distribution's `ColorExplainer` port. Its static implementation reads PersonalityTypeProfile from Catalog; the Mastra agent plugs into the same port later |
| Every trait is mapped exactly once, when used to group attendees | domain (consumer) | Color Distribution's local `TraitTypeMapping` VO, built by a `CatalogTraitTypeMappingProvider` adapter that replaces `ProvisionalTraitTypeMappingProvider` |

---

## Value Objects

| Name | Kind | Base / Components | Construction Rule | Invalid States | Scope |
|---|---|---|---|---|---|
| Trait | basic | string | One of the 33 traits | any value outside the list | SK::Trait |
| PersonalityType | basic | string | One of exactly 4 types: explorer, connector, planner, dreamer | any value outside the 4 types | SK::PersonalityType |
| QuestionId | basic | string | Non-empty | empty | Local |
| AnswerId | basic | string | Non-empty | empty | Local |
| IcebreakerId | basic | string | Non-empty | empty | Local |
| Theme | basic | string | One of the 20 themes (closed set) | any value outside the 20 themes | Local |
| Answer | composite | AnswerId + SK::Trait (+ rule-free text) | An answer id and the trait picking it hints at | missing id or trait | Local |
| AnswerCollection | collection | Answer | Exactly 4 answers; AnswerIds unique within the question | fewer or more than 4; a repeated AnswerId | Local |
| IcebreakerTraitCollection | collection | SK::Trait | 1 to 3 traits, no duplicates | empty; more than 3; a repeated trait | Local |
| ProfileTraitCollection | collection | SK::Trait | Exactly 3 traits, no duplicates; each trait is mapped to the profile's type (checked at the seed) | not exactly 3; a repeated trait; a trait mapped to another type | Local |

### ProfileTraitCollection — Detail

**Construction rule:** holds the 3 trait chips shown at the reveal for one personality type. No duplicates. The seed also checks that each trait is mapped to the profile's own type in the TraitTypeMapping. The read path doesn't repeat that check, because the content never changes after seeding.
**Immutable:** yes
**Equality:** by value

### AnswerCollection — Detail

**Construction rule:** exactly the 4 answers of one question, with AnswerIds unique within that question. Order is the order authored in the JSON.
**Immutable:** yes
**Equality:** by value

---

## Domain Events

None for the MVP: the content is read-only.

| Event | Trigger | Aggregate | Payload | Status |
|---|---|---|---|---|
| (catalog content edited) | An operator changes catalog content | — | — | 🕓 Deferred — only if content becomes editable after the MVP |

---

## Shared Kernel References

| SK Type | Used by | Reason |
|---|---|---|
| SK::Trait | Answer, IcebreakerTraitCollection, ProfileTraitCollection, TraitTypeMapping | The closed list of 33 traits is used by Catalog, Participation, Color Distribution and icebreaker selection |
| SK::PersonalityType | PersonalityTypeProfile, TraitTypeMapping | A closed set of 4. Catalog keys the profiles and the mapping by it; Color Distribution assigns it and balances groups with it. It was moved from Color Distribution (Local) to the shared kernel in this session |

TraitTypeMapping itself is not shared. Catalog owns its content as a read model, and Color Distribution keeps its own local `TraitTypeMapping` VO with the rule that uses it.

---

## Ubiquitous Language

| Term | Definition |
|---|---|
| Catalog | The fixed game content: questions, icebreakers, personality type profiles and the trait-type mapping. Read during an event, never changed by it |
| Seed | Loading the catalog content from the `tools/` JSON files into Postgres |
| Theme | The topic a question or icebreaker belongs to; one of 20 |
| Personality type profile | The copy shown at the reveal for one personality type: nickname, blurb and 3 trait chips |
| Trait-type mapping | The table placing each of the 33 traits in exactly one personality type. Catalog owns its content; Color Distribution owns the rule that uses it |

---

## Open Questions

- Color Distribution's model still lists `PersonalityType` as Local. It must be updated to reference `SK::PersonalityType`. That's outside this model, so it's left to the color-distribution owner.
