# Discovery — Catalog

**Status**: Ready for Modeling
**Kind**: Read-write (content is written by the seed through the aggregates; read-only during an event)
**Last session**: 2026-10-11
**Feature context**: `openspec/changes/backend-skeleton-and-catalog/proposal.md` — catalog part. Also the cleanup of branch `api-types-and-contract-gaps`, which put catalog content in `api/src/Types/`.
**Generated with**: ddd-modeling 0.4.0-alpha

## Ubiquitous Language
| Term | Definition | Status |
|---|---|---|
| Theme | The topic a question or icebreaker belongs to; one of 20 | ✅ Confirmed |
| Trait-type mapping | The table placing each of the 33 traits in exactly one personality type. Catalog owns its content; Color Distribution owns the rule that uses it | ✅ Confirmed |
| Personality type profile | The copy shown at the reveal for one personality type: nickname, blurb and 3 trait chips | ✅ Confirmed |
| Catalog | The fixed game content: questions, icebreakers, personality type profiles and the trait-type mapping. Read during an event, never changed by it | ✅ Confirmed |
| Seed | Loading the catalog content from the `tools/` JSON files into Postgres through the aggregates; runs once per database, which records when it ran | ✅ Confirmed |
| Author | Creating a question or icebreaker at the seed; content is never revised afterwards (MVP) | ✅ Confirmed |
| PersonalityTypes | The trait-type mapping and the 4 personality type profiles, defined together as one aggregate | ✅ Confirmed |

## Aggregate Candidates
| Name | Responsibilities | Invariants | Status |
|---|---|---|---|
| Question | A question with its 4 answers (entities with their own AnswerId); authored once, at the seed | Exactly 4 answers; AnswerIds unique within the question | ✅ Confirmed |
| Icebreaker | An open question to start a conversation and the traits it suits | 1 to 3 distinct traits | ✅ Confirmed |
| PersonalityTypes | The trait-type mapping and the 4 profiles together, since one rule spans both | Every trait mapped exactly once; exactly one profile per type; each profile's chips are mapped to its own type | ✅ Confirmed |

## Domain Action Candidates
| Name | Aggregate | Trigger | Preconditions | Invariants Enforced | Emits | Status |
|---|---|---|---|---|---|---|
| author | Question | Seed | — | Exactly 4 answers; AnswerIds unique; texts and theme valid | QuestionAuthored | ✅ Confirmed |
| revise | Question | — | — | — | — | ❌ Rejected: content is frozen after the first seed (MVP) |
| author | Icebreaker | Seed | — | 1 to 3 distinct traits; text and theme valid | IcebreakerAuthored | ✅ Confirmed |
| revise | Icebreaker | — | — | — | — | ❌ Rejected: content is frozen after the first seed (MVP) |
| define | PersonalityTypes | Seed; the mapping and the 4 profiles are defined as a whole | — | Every trait mapped once; one profile per type; chips mapped to their own type | PersonalityTypesDefined | ✅ Confirmed |
| redefine | PersonalityTypes | — | — | — | — | ❌ Rejected: content is frozen after the first seed (MVP) |

## Value Object Candidates
| Name | Kind | Construction Rule | Scope | Status |
|---|---|---|---|---|
| Trait | basic (wraps string) | One of the 33 traits | SK::Trait | ✅ Confirmed |
| PersonalityType | basic (wraps string) | One of exactly 4 types: explorer, connector, planner, dreamer | ⬆️ To Shared Kernel (from Color Distribution, where it is Local today) | ✅ Confirmed |
| QuestionId | basic (wraps string) | Non-empty | Local | ✅ Confirmed |
| Theme | basic (wraps string) | One of the 20 themes (closed set) | Local | ✅ Confirmed |
| AnswerId | basic (wraps string) | Non-empty | Local | ✅ Confirmed |
| Answer | ❌ not a VO: an entity inside the Question aggregate (it has its own AnswerId) | — | Local | ❌ Rejected as VO |
| AnswerCollection | collection (of Answer) | Exactly 4 answers; AnswerIds unique within the question | Local | ✅ Confirmed |
| IcebreakerId | basic (wraps string) | Non-empty | Local | ✅ Confirmed |
| IcebreakerTraitCollection | collection (of SK::Trait) | 1 to 3 traits, no duplicates | Local | ✅ Confirmed |
| QuestionText | basic (wraps string) | Not empty; at most 80 characters | Local | ✅ Confirmed |
| AnswerText | basic (wraps string) | Not empty; at most 80 characters | Local | ✅ Confirmed |
| Nickname | basic (wraps string) | Surrounding whitespace trimmed; not empty; at most 80 characters | Local | ✅ Confirmed |
| IcebreakerText | basic (wraps string) | Not empty; at most 200 characters | Local | ✅ Confirmed |
| Blurb | basic (wraps string) | Not empty; at most 200 characters | Local | ✅ Confirmed |
| ProfileTraitCollection | collection (of SK::Trait) | Exactly 3 traits, no duplicates; that each trait is mapped to the profile's type is enforced by the PersonalityTypes aggregate | Local | ✅ Confirmed |

## Read Models
<!-- Read-only contexts. Fields reference VOs, except rule-free primitives. -->
<!-- Superseded in session 2: Catalog is read-write; the reads below are now served from the aggregates (Question, Icebreaker, PersonalityTypes) through DTOs. -->
| Name | Fields | Source (producer) | Read invariants | Status |
|---|---|---|---|---|
| Question | id: QuestionId; theme: Theme; text (non-empty, rule-free); answers: AnswerCollection | Seed from `tools/` questions JSON | — | ❌ Superseded (session 2) |
| Icebreaker | id: IcebreakerId; theme: Theme; text (non-empty, rule-free); traits: IcebreakerTraitCollection | Seed from `tools/` icebreakers JSON | — | ❌ Superseded (session 2) |
| PersonalityTypeProfile | type: SK::PersonalityType; nickname (rule-free); blurb (rule-free); traits: ProfileTraitCollection | Seed from `tools/` personality types JSON (new) | Exactly one profile per SK::PersonalityType (4) | ❌ Superseded (session 2) |
| TraitTypeMapping | 33 SK::Trait → SK::PersonalityType pairs | Seed from `tools/` mapping JSON (new) | Every one of the 33 traits appears exactly once | ❌ Superseded (session 2) |

## Domain Events
| Name | Trigger | Payload | Status |
|---|---|---|---|
| QuestionAuthored | Question.author | questionId | ✅ Confirmed (no subscriber yet) |
| QuestionRevised | question.revise | questionId | ❌ Rejected: no revise path (content frozen after the first seed) |
| IcebreakerAuthored | Icebreaker.author | icebreakerId | ✅ Confirmed (no subscriber yet) |
| IcebreakerRevised | icebreaker.revise | icebreakerId | ❌ Rejected: no revise path (content frozen after the first seed) |
| PersonalityTypesDefined | PersonalityTypes.define | — | ✅ Confirmed (no subscriber yet) |
| PersonalityTypesRedefined | personalityTypes.redefine | — | ❌ Rejected: no revise path (content frozen after the first seed) |

## Rule placement
| Rule | Lives in | Where exactly |
|---|---|---|
| Catalog JSON is valid before it is stored | boundary | Seed command validates the shape of the `tools/` JSON; since session 2 the content rules are the aggregates' |
| Reveal copy (nickname, blurb, traits, reason sentence) for an assignment | infrastructure | Color Distribution's `ColorExplainer` port; its static implementation reads the PersonalityTypeProfile from Catalog and writes the reason. The Mastra agent plugs into the same port later |
| The seed runs only once per database; the database records when it was seeded, and a later run does nothing | infrastructure | A seed record (seeded-at timestamp) in the database, checked before seeding |
| An event's question set does not change once the event runs, whatever happens to the catalog | domain (consumer) | Participation/Event fix the question set of an event when it runs; Catalog revisions never reach a running or past event |
| Which questions or icebreaker an event uses | domain (consumer) | Each consuming context selects from Catalog's full lists (Participation picks questions, Night icebreaker picks the icebreaker) |
| Each profile trait is mapped to the profile's type | domain | PersonalityTypes.define (session 2; was: the seed command's cross-check) |

## Open Ambiguities
| Question | Context | Resolution |
|---|---|---|
| Where is "each profile trait is mapped to its type" checked? | The rule spans two read models (PersonalityTypeProfile and TraitTypeMapping) | Session 1: at the seed. Superseded in session 2: in the PersonalityTypes aggregate |
| Who owns PersonalityType: the shared kernel, or Catalog with Color Distribution keeping its own copy? | Color Distribution defines it as a Local VO, and Catalog needs the same 4 codes for profiles and the mapping | Shared kernel: both contexts reference SK::PersonalityType |
| Is Catalog really read-only, or is loading content (the seed) a domain action with rules the domain must protect? | Session 2 code review: every write-side rule (4 answers, unique ids, 1-3 traits, one profile per type, chips mapped to their type, every trait once, answers replaced, nothing deleted) runs on zod-inferred primitives in Infrastructure; the domain objects are only built when reading | Read-write. Reading `tools/` JSON is infrastructure; the seed maps it into the aggregates, which enforce the rules. For the MVP the seed may write rows straight to the database, as long as what it writes is exactly what the aggregates accepted |
| Does an unchanged re-seed record *Revised events? | The seed is idempotent and re-run on every deploy; revising 101 unchanged items would emit 101 events | Moot in production: the seed runs only once per database, and the database records when it was seeded; a later run does nothing |
| Once a database is seeded, how do content edits reach it — and does `revise` still exist? | The seed runs once, so revise would never run in production | They don't, for the MVP: content is frozen after the first seed; changing it means recreating the database. revise/redefine and their events are dropped |
| Does "tools should move to infra" mean the JSON files physically move into `api/` (Catalog Infrastructure), or only that reading them is an infrastructure adapter? | CLAUDE.md today says content stays in `tools/` and `api/` never imports it | Resolved in `catalog-aggregates`: the files moved into `api/src/Catalog/Infrastructure/Content/` and `tools/` was removed |
| Which free-text fields become VOs? | Question text, answer text, icebreaker text, nickname and blurb are raw strings; session 1 called them rule-free, but the code enforces non-empty on them | All five: not empty, at most 80 characters; Nickname also trims surrounding whitespace |
| Does the 80-character limit apply to icebreakers and blurbs? | The current content breaks it: 49/51 icebreakers (max 165) and 4/4 blurbs (max 112) | No: icebreakers and blurbs allow up to 200 characters; questions, answers and nicknames keep 80 |
| Is Answer a value object or an entity? | It has its own identity (AnswerId), yet is modeled as a VO | Entity inside the Question aggregate |
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
- 2026-10-11 — Session 2. Reopened after a code review of branch `catalog-model`.
  - Finding: the domain model is only used on the read path; the seed (the only write) validates and stores zod-inferred primitives without touching the domain.
  - Finding: Question, Icebreaker, Answer and PersonalityTypeProfile still hold raw strings (text, nickname, blurb).
  - Opened: Read-only vs read-write, free-text VOs, Answer as VO or entity (resolved below).
  - Decision: Catalog becomes read-write. The `tools/` JSON is an infrastructure source; the seed maps it into domain aggregates, which own the content rules. MVP shortcut: the seed may persist straight to the DB, provided it only writes what the aggregates accepted.
  - Decision: three aggregates — Question (with Answer entities), Icebreaker, and PersonalityTypes (the trait-type mapping and the 4 profiles together, so the chip rule has one owner). Name `PersonalityTypes` is the working name.
  - Decision: free text becomes VOs (QuestionText, AnswerText, IcebreakerText, Nickname, Blurb): not empty, at most 80 characters; Nickname trims surrounding whitespace. Icebreaker text and blurb allow 200 instead, so the current content fits.
  - Decision: actions author/revise on Question and Icebreaker, define/redefine on PersonalityTypes (always as a whole). Revise may change anything, answer ids and traits included: a running event fixes its own question set, so catalog changes cannot alter it. That protection belongs to the consumer, not to Catalog.
  - Decision: content missing from the files is kept and stays pickable (no delete, no retire), even though events now fix their own question set.
  - Decision: every action records an event (QuestionAuthored/Revised, IcebreakerAuthored/Revised, PersonalityTypesDefined/Redefined). Recorded by the aggregates and dispatched by the seed after it persists; no subscriber for the MVP.
  - Decision: the seed runs once per database in production; the database stores when it was seeded, and a second run is a no-op. Open: how later content edits ship, and whether revise survives.
  - Decision: content is frozen after the first seed (MVP). revise/redefine and the *Revised/Redefined events are dropped; the "keep content missing from the files" rule no longer applies. Changing content means recreating the database.
  - Closed: ubiquitous language confirmed (Author, PersonalityTypes, Seed once per database). Status set to Ready for Modeling.
