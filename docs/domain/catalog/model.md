# Domain Model — Catalog

**Version**: 2.0.0
**Status**: Accepted
**Date**: 2026-10-11
**Kind**: Read-write
**Source**: discovery.md session 2026-10-11 (supersedes model 1.0.0, read-only, from session 2026-10-10)
**Generated with**: ddd-modeling 0.4.0-alpha

---

## Bounded Context

Catalog holds the fixed game content: the questions with their trait-tagged answers, the icebreakers, and the personality types (the trait-type mapping with the 4 personality type profiles shown at the reveal). The content is written once, by the seed, which authors each question and icebreaker and defines the personality types through the aggregates, so every content rule is kept by the domain. The seed runs once per database; after it, the content is frozen and only read (MVP: changing it means recreating the database).

Catalog is NOT responsible for:
- reading the `tools/` JSON files or remembering that a database was seeded (infrastructure of the seed);
- choosing which questions an event asks, or keeping an event's question set fixed once it runs (Participation / Event);
- choosing the night's icebreaker (Night icebreaker);
- deriving an attendee's personality type or group (Color Distribution, which owns the rule that uses the trait-type mapping);
- writing the reveal sentence for an assignment (Color Distribution's `ColorExplainer` port, which reads profiles from here).

## Aggregates

| Aggregate Root | Responsibilities | Invariants |
|---|---|---|
| Question | A question with its theme, text and 4 answers, each answer hinting at one trait | Exactly 4 answers; AnswerIds unique within the question |
| Icebreaker | An open question to start a conversation, with its theme and the traits it suits | 1 to 3 distinct traits |
| PersonalityTypes | The trait-type mapping and the 4 personality type profiles, defined together | Every trait mapped to exactly one type; exactly one profile per type; each profile's trait chips are mapped to the profile's own type |

### Question — Detail

**Entities within this aggregate:**
- Answer — one selectable answer, identified by its AnswerId within the question: `id: AnswerId`, `text: AnswerText`, `trait: SK::Trait`

**Invariants:**
- A question always has exactly 4 answers, in authored order.
- No two answers of a question share an AnswerId.

**Lifecycle events:**
- QuestionAuthored — triggered when the seed authors the question

**Domain actions:**

| Action | Preconditions | Invariants enforced | Emits |
|---|---|---|---|
| author(QuestionId id, Theme theme, QuestionText text, AnswerCollection answers) | — (the seed runs once per database, so the question is new) | Exactly 4 answers; AnswerIds unique | QuestionAuthored |

There is no revise action: content is frozen after the first seed (MVP).

### Icebreaker — Detail

**Entities within this aggregate:** none

**Invariants:**
- An icebreaker suits 1 to 3 traits, with no trait repeated.

**Lifecycle events:**
- IcebreakerAuthored — triggered when the seed authors the icebreaker

**Domain actions:**

| Action | Preconditions | Invariants enforced | Emits |
|---|---|---|---|
| author(IcebreakerId id, Theme theme, IcebreakerText text, IcebreakerTraitCollection traits) | — (the seed runs once per database, so the icebreaker is new) | 1 to 3 distinct traits | IcebreakerAuthored |

There is no revise action: content is frozen after the first seed (MVP).

### PersonalityTypes — Detail

A single instance per catalog.

**Entities within this aggregate:**
- PersonalityTypeProfile — the reveal copy of one personality type, identified by its SK::PersonalityType: `type: SK::PersonalityType`, `nickname: Nickname`, `blurb: Blurb`, `traits: ProfileTraitCollection`

**Invariants:**
- Every one of the 33 traits is mapped to exactly one personality type (kept by TraitTypeMapping).
- There is exactly one profile per personality type, 4 in total (kept by PersonalityTypeProfileCollection).
- Each trait chip of a profile is mapped, in this aggregate's TraitTypeMapping, to that profile's own type. This rule spans the mapping and the profiles, which is why both live in one aggregate.

**Lifecycle events:**
- PersonalityTypesDefined — triggered when the seed defines the personality types

**Domain actions:**

| Action | Preconditions | Invariants enforced | Emits |
|---|---|---|---|
| define(TraitTypeMapping mapping, PersonalityTypeProfileCollection profiles) | — (defined as a whole, once, at the seed) | Every trait mapped once; one profile per type; each profile's chips mapped to its own type | PersonalityTypesDefined |

There is no redefine action: content is frozen after the first seed (MVP).

---

## Queries

The other contexts read the catalog through simple named reads. Catalog takes no Criteria: each consuming context makes its own selection from the full lists. Repositories return aggregates; Catalog's application service turns them into plain DTOs, so no Catalog domain object reaches another context.

| Repository | Accepts | Returns |
|---|---|---|
| CatalogRepository.allQuestions | — | every Question, ordered by QuestionId, answers in authored order |
| CatalogRepository.allIcebreakers | — | every Icebreaker, ordered by IcebreakerId |
| CatalogRepository.personalityTypes | — | the PersonalityTypes (its profile of a SK::PersonalityType, and its TraitTypeMapping) |

The application service keeps the reads other contexts already use: `allQuestions`, `allIcebreakers`, `profileOf(SK::PersonalityType)` and `mapping`.

### Rule placement

| Rule | Lives in | Where exactly |
|---|---|---|
| A question has exactly 4 answers with unique AnswerIds | domain | Question (AnswerCollection) |
| An icebreaker suits 1 to 3 distinct traits | domain | Icebreaker (IcebreakerTraitCollection) |
| Every trait mapped once; one profile per type; each profile's chips mapped to its own type | domain | PersonalityTypes (TraitTypeMapping, PersonalityTypeProfileCollection, and the aggregate for the cross rule) |
| Texts are not empty and within their length; a nickname is trimmed | domain | QuestionText, AnswerText, IcebreakerText, Nickname, Blurb |
| The `tools/` JSON has the expected shape before it is mapped | boundary | The seed's content schemas; they only check shape, the content rules are the aggregates' |
| The seed runs once per database, and a database records when it was seeded | infrastructure | A seed record (seeded-at) checked before seeding; a second run does nothing |
| The seed writes only what the aggregates accepted | infrastructure | MVP shortcut: the seed may write rows straight to the database, after building every aggregate |
| An event's question set does not change once the event runs | domain (consumer) | Participation / Event keep the event's own copy of its questions |
| Which questions or icebreaker an event uses | domain (consumer) | Participation picks questions; Night icebreaker picks the icebreaker |
| Reveal copy for an assignment | infrastructure (consumer) | Color Distribution's `ColorExplainer` port; its static implementation reads the profile from Catalog |
| Every trait is mapped exactly once, when used to group attendees | domain (consumer) | Color Distribution's local `TraitTypeMapping` VO, built from Catalog's mapping |

---

## Value Objects

| Name | Kind | Base / Components | Construction Rule | Invalid States | Scope |
|---|---|---|---|---|---|
| Trait | basic | string | One of the 33 traits | any value outside the list | SK::Trait |
| PersonalityType | basic | string | One of exactly 4 types: explorer, connector, planner, dreamer | any value outside the 4 types | SK::PersonalityType |
| QuestionId | basic | string | Not empty | empty | Local |
| AnswerId | basic | string | Not empty | empty | Local |
| IcebreakerId | basic | string | Not empty | empty | Local |
| Theme | basic | string | One of the 20 themes (closed set) | any value outside the 20 themes | Local |
| QuestionText | basic | string | Not empty; at most 80 characters | empty; longer than 80 | Local |
| AnswerText | basic | string | Not empty; at most 80 characters | empty; longer than 80 | Local |
| IcebreakerText | basic | string | Not empty; at most 200 characters | empty; longer than 200 | Local |
| Nickname | basic | string | Surrounding whitespace trimmed; then not empty; at most 80 characters | empty or only whitespace; longer than 80 after trimming | Local |
| Blurb | basic | string | Not empty; at most 200 characters | empty; longer than 200 | Local |
| TraitType | composite | SK::Trait + SK::PersonalityType | One trait and the personality type it is mapped to | missing trait or type | Local |
| AnswerCollection | collection | Answer (entity) | Exactly 4 answers, in authored order; AnswerIds unique | fewer or more than 4; a repeated AnswerId | Local |
| IcebreakerTraitCollection | collection | SK::Trait | 1 to 3 traits, no duplicates | empty; more than 3; a repeated trait | Local |
| ProfileTraitCollection | collection | SK::Trait | Exactly 3 traits, no duplicates | not exactly 3; a repeated trait | Local |
| TraitTypeMapping | collection | TraitType | Every one of the 33 traits exactly once | a trait missing; a trait repeated | Local |
| PersonalityTypeProfileCollection | collection | PersonalityTypeProfile (entity) | Exactly one profile per SK::PersonalityType (4) | a type without a profile; a type with two | Local |

### Nickname — Detail

**Construction rule:** surrounding whitespace is trimmed first; the trimmed value must not be empty and must be at most 80 characters. The stored value is the trimmed one.
**Immutable:** yes
**Equality:** by value

### TraitTypeMapping — Detail

**Construction rule:** places each of the 33 SK::Trait values in exactly one SK::PersonalityType. A trait missing or listed twice is rejected. Color Distribution keeps its own local `TraitTypeMapping` with the rule that uses it; this one is Catalog's content.
**Immutable:** yes
**Equality:** by value

### AnswerCollection — Detail

**Construction rule:** exactly the 4 answers of one question, in the order authored in the content, with AnswerIds unique within that question.
**Immutable:** yes
**Equality:** by value

### ProfileTraitCollection — Detail

**Construction rule:** the 3 distinct trait chips shown at the reveal for one personality type. That each chip is mapped to the profile's own type is not checked here: it needs the mapping, so the PersonalityTypes aggregate checks it in `define`.
**Immutable:** yes
**Equality:** by value

---

## Domain Events

Recorded by the aggregates and dispatched by the seed after it has written the content. No context subscribes to them yet.

| Event | Trigger | Aggregate | Payload | Status |
|---|---|---|---|---|
| QuestionAuthored | The seed authors a question | Question | questionId: QuestionId | Active |
| IcebreakerAuthored | The seed authors an icebreaker | Icebreaker | icebreakerId: IcebreakerId | Active |
| PersonalityTypesDefined | The seed defines the personality types | PersonalityTypes | — | Active |

No revise or redefine events: content is frozen after the first seed (MVP).

---

## Shared Kernel References

| SK Type | Used by | Reason |
|---|---|---|
| SK::Trait | Answer, IcebreakerTraitCollection, ProfileTraitCollection, TraitType | The closed list of 33 traits is used by Catalog, Participation, Color Distribution and icebreaker selection |
| SK::PersonalityType | PersonalityTypeProfile, TraitType, PersonalityTypeProfileCollection | A closed set of 4. Catalog keys the profiles and the mapping by it; Color Distribution assigns it and balances groups with it |

TraitTypeMapping itself is not shared. Catalog owns its content, and Color Distribution keeps its own local `TraitTypeMapping` VO with the rule that uses it.

---

## Ubiquitous Language

| Term | Definition |
|---|---|
| Catalog | The fixed game content: questions, icebreakers and the personality types. Written once by the seed, read during an event, never changed by it |
| Seed | Loading the catalog content from the `tools/` JSON files into Postgres through the aggregates; runs once per database, which records when it ran |
| Author | Creating a question or icebreaker at the seed; content is never revised afterwards (MVP) |
| PersonalityTypes | The trait-type mapping and the 4 personality type profiles, defined together as one aggregate |
| Theme | The topic a question or icebreaker belongs to; one of 20 |
| Personality type profile | The copy shown at the reveal for one personality type: nickname, blurb and 3 trait chips |
| Trait-type mapping | The table placing each of the 33 traits in exactly one personality type. Catalog owns its content; Color Distribution owns the rule that uses it |

---

## Open Questions

- Do the content JSON files physically move from `tools/` into `api/` (Catalog infrastructure), or does only reading them count as infrastructure? Deferred to implementation; it does not change the model.
