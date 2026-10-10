# Discovery — Catalog

**Status**: Ready for Modeling
**Kind**: Read-only
**Last session**: 2026-10-10
**Feature context**: `openspec/changes/backend-skeleton-and-catalog/proposal.md` — catalog part. Also the cleanup of branch `api-types-and-contract-gaps`, which put catalog content in `api/src/Types/`.
**Generated with**: ddd-modeling 0.4.0-alpha

## Ubiquitous Language
| Term | Definition | Status |
|---|---|---|
| Theme | The topic a question or icebreaker belongs to; one of 20 | ✅ Confirmed |
| Trait-type mapping | The table placing each of the 33 traits in exactly one personality type. Catalog owns its content; Color Distribution owns the rule that uses it | ✅ Confirmed |
| Personality type profile | The copy shown at the reveal for one personality type: nickname, blurb and 3 trait chips | ✅ Confirmed |
| Catalog | The fixed game content: questions, icebreakers, personality type profiles and the trait-type mapping. Read during an event, never changed by it | ✅ Confirmed |
| Seed | Loading the catalog content (questions, icebreakers, personality type profiles, trait-type mapping) from the `tools/` JSON files into Postgres | ✅ Confirmed |

## Aggregate Candidates
| Name | Responsibilities | Invariants | Status |
|---|---|---|---|

## Domain Action Candidates
| Name | Aggregate | Trigger | Preconditions | Invariants Enforced | Emits | Status |
|---|---|---|---|---|---|---|

## Value Object Candidates
| Name | Kind | Construction Rule | Scope | Status |
|---|---|---|---|---|
| Trait | basic (wraps string) | One of the 33 traits | SK::Trait | ✅ Confirmed |
| PersonalityType | basic (wraps string) | One of exactly 4 types: explorer, connector, planner, dreamer | ⬆️ To Shared Kernel (from Color Distribution, where it is Local today) | ✅ Confirmed |
| QuestionId | basic (wraps string) | Non-empty | Local | ✅ Confirmed |
| Theme | basic (wraps string) | One of the 20 themes (closed set) | Local | ✅ Confirmed |
| AnswerId | basic (wraps string) | Non-empty | Local | ✅ Confirmed |
| Answer | composite (AnswerId + SK::Trait) | An id and the trait it hints at; its text is rule-free | Local | ✅ Confirmed |
| AnswerCollection | collection (of Answer) | Exactly 4 answers; AnswerIds unique within the question | Local | ✅ Confirmed |
| IcebreakerId | basic (wraps string) | Non-empty | Local | ✅ Confirmed |
| IcebreakerTraitCollection | collection (of SK::Trait) | 1 to 3 traits, no duplicates | Local | ✅ Confirmed |
| ProfileTraitCollection | collection (of SK::Trait) | Exactly 3 traits, no duplicates; each trait is mapped to the profile's type in the TraitTypeMapping | Local | ✅ Confirmed |

## Read Models
<!-- Read-only contexts. Fields reference VOs, except rule-free primitives. -->
| Name | Fields | Source (producer) | Read invariants | Status |
|---|---|---|---|---|
| Question | id: QuestionId; theme: Theme; text (non-empty, rule-free); answers: AnswerCollection | Seed from `tools/` questions JSON | — | ✅ Confirmed |
| Icebreaker | id: IcebreakerId; theme: Theme; text (non-empty, rule-free); traits: IcebreakerTraitCollection | Seed from `tools/` icebreakers JSON | — | ✅ Confirmed |
| PersonalityTypeProfile | type: SK::PersonalityType; nickname (rule-free); blurb (rule-free); traits: ProfileTraitCollection | Seed from `tools/` personality types JSON (new) | Exactly one profile per SK::PersonalityType (4) | ✅ Confirmed |
| TraitTypeMapping | 33 SK::Trait → SK::PersonalityType pairs | Seed from `tools/` mapping JSON (new) | Every one of the 33 traits appears exactly once | ✅ Confirmed |

## Domain Events
| Name | Trigger | Payload | Status |
|---|---|---|---|
| (content edited) | An operator changes catalog content | — | 🕓 Deferred — only if content becomes editable after the MVP |

## Rule placement
| Rule | Lives in | Where exactly |
|---|---|---|
| Catalog JSON is valid before it is stored | boundary | Seed command validates the `tools/` JSON with the api's own schema |
| Reveal copy (nickname, blurb, traits, reason sentence) for an assignment | infrastructure | Color Distribution's `ColorExplainer` port; its static implementation reads the PersonalityTypeProfile from Catalog and writes the reason. The Mastra agent plugs into the same port later |
| Which questions or icebreaker an event uses | domain (consumer) | Each consuming context selects from Catalog's full lists (Participation picks questions, Night icebreaker picks the icebreaker) |
| Each profile trait is mapped to the profile's type | boundary | Seed command (and `tools/` validate) cross-checks the profiles JSON against the mapping JSON |

## Open Ambiguities
| Question | Context | Resolution |
|---|---|---|
| Where is "each profile trait is mapped to its type" checked? | The rule spans two read models (PersonalityTypeProfile and TraitTypeMapping) | At the seed: content is read-only, so the seed is the only place it can break |
| Who owns PersonalityType: the shared kernel, or Catalog with Color Distribution keeping its own copy? | Color Distribution defines it as a Local VO, and Catalog needs the same 4 codes for profiles and the mapping | Shared kernel: both contexts reference SK::PersonalityType |
| Are personality type profiles and the trait-type mapping also seeded from `tools/` JSON? | Today they are TS constants in `api/src/Types/PersonalityType.ts` and `ProvisionalTraitTypeMappingProvider`, with no JSON in `tools/` | Yes: both move to JSON in `tools/` and are seeded into Postgres like questions and icebreakers |

## Session Log
<!-- Append-only. One entry per session. -->
- 2026-10-10 — Session 1.
  - Kind: Read-only for the MVP. Protected, editable content is deferred.
  - Producer: a seed command loads the `tools/` JSON into Postgres.
  - Decision: no aggregate and no domain events for the MVP.
  - Decision: personality type profiles and the trait-type mapping become `tools/` JSON and are seeded too.
  - Decision: PersonalityType moves to the shared kernel.
  - Decision: Question confirmed. Ids only need to be non-empty (no format). Theme is local to Catalog.
  - Decision: Icebreaker confirmed (1-3 unique traits). Profile traits get their own collection: exactly 3, each mapped to the profile's type.
  - Decision: the profile/mapping cross-check runs at the seed, not on read.
  - Decision: Catalog exposes the mapping as a read model. Color Distribution keeps its local TraitTypeMapping VO and port, and a CatalogTraitTypeMappingProvider adapter replaces ProvisionalTraitTypeMappingProvider. The mapping is not in the SK; only Trait and PersonalityType are.
  - Decision: Color Distribution gets reveal copy through a `ColorExplainer` port backed by Catalog. The web contract of the assignment read is unchanged.
  - Decision: reads are simple named reads on a repository (`allQuestions()`, `allIcebreakers()`, `profileOf(type)`, `mapping()`), with no Criteria. Selection belongs to each consuming context.
