# catalog Specification

## Purpose

Holds the read-only game content (questions with trait-tagged answers, icebreakers, the personality type profiles and the trait-type mapping), seeds it from the content files in `tools/`, and lets the other contexts read it through simple named reads.

## Requirements

### Requirement: Catalog content is seeded from the content files
The system SHALL load the catalog content from four JSON files in `tools/` into its database: the questions, the icebreakers, the personality type profiles and the trait-type mapping (default paths, or paths given to the seed command). All four files SHALL be validated against Catalog's content schemas, and each profile's trait chips SHALL be cross-checked against the mapping, before anything is written; if any check fails, nothing SHALL be written. Seeding SHALL be repeatable: running it again with the same files SHALL leave the catalog unchanged, and running it with edited files SHALL update the existing entries by key. Questions and icebreakers that disappear from a file SHALL be kept, so events that already use them keep working.

#### Scenario: First seed loads all content
- **WHEN** the seed command runs on an empty catalog with the current content files
- **THEN** the catalog contains 50 questions with 4 answers each, 51 icebreakers, 4 personality type profiles and a mapping of all 33 traits

#### Scenario: Invalid file writes nothing
- **WHEN** the seed command runs with a questions file in which one answer has a trait outside the 33 traits
- **THEN** the command fails, names the file and the invalid entry, and the catalog is unchanged

#### Scenario: Profile chip mapped to another type writes nothing
- **WHEN** the seed command runs with a profiles file whose planner profile shows the chip `curious`, which the mapping places in explorer
- **THEN** the command fails, names the profile and the chip, and the catalog is unchanged

#### Scenario: Seeding twice changes nothing
- **WHEN** the seed command runs twice with the same files
- **THEN** the catalog content is the same as after the first run

#### Scenario: Edited text updates the entry
- **WHEN** the text of question `q0001` is changed in the file and the seed command runs again
- **THEN** question `q0001` has the new text and keeps its id and answers

#### Scenario: Removed question is kept
- **WHEN** a question that was seeded before is missing from the file and the seed command runs again
- **THEN** that question is still in the catalog

### Requirement: Content files hold only valid content
A question SHALL have a non-empty id and text, one of the 20 themes, and exactly 4 answers with ids unique within the question, each with non-empty text and one of the 33 traits. An icebreaker SHALL have a non-empty id and text, one of the 20 themes and 1 to 3 distinct traits. There SHALL be exactly one profile per personality type, each with a non-empty nickname and blurb and exactly 3 distinct trait chips. The mapping SHALL place each of the 33 traits in exactly one of the 4 personality types.

#### Scenario: Question with a repeated answer id
- **WHEN** a question lists two answers with the id `q0001-a`
- **THEN** the content is rejected

#### Scenario: Missing profile
- **WHEN** the profiles file has no profile for dreamer
- **THEN** the content is rejected

#### Scenario: Unmapped trait
- **WHEN** the mapping file has no entry for `honest`
- **THEN** the content is rejected

### Requirement: Questions and icebreakers are readable as full lists
The system SHALL let other contexts read every question, ordered by id, each with its theme, text and 4 answers in file order (id, text, trait), and every icebreaker, ordered by id, with its theme, text and traits. Catalog SHALL NOT select or filter content for a consumer; each consumer makes its own selection from the full lists.

#### Scenario: List all questions
- **WHEN** a context lists the questions of a seeded catalog
- **THEN** it receives every question ordered by id, each with 4 answers in file order and the trait of each answer

#### Scenario: List all icebreakers
- **WHEN** a context lists the icebreakers of a seeded catalog
- **THEN** it receives every icebreaker ordered by id, each with its theme, text and traits

### Requirement: The profile of a personality type is readable
The system SHALL return the profile of a given personality type: its nickname, blurb and 3 trait chips.

#### Scenario: Read a profile
- **WHEN** a context reads the profile of planner
- **THEN** it receives the planner nickname, blurb and its 3 trait chips

### Requirement: The trait-type mapping is readable
The system SHALL return the trait-type mapping, in which each of the 33 traits appears exactly once with its personality type.

#### Scenario: Read the mapping
- **WHEN** a context reads the mapping of a seeded catalog
- **THEN** it receives 33 pairs, one per trait, and every personality type has at least one trait

### Requirement: Color distribution uses the catalog's mapping and profiles
Color distribution SHALL derive personality types with the catalog's trait-type mapping, in place of the provisional mapping, and its static reveal copy SHALL come from the catalog's profile of the attendee's personality type.

#### Scenario: Personality type from the catalog mapping
- **WHEN** an attendee completes the questionnaire with traits that all map to planner in the catalog mapping
- **THEN** the attendee is assigned with personality type planner

#### Scenario: Reveal copy from the catalog profile
- **WHEN** an assigned dreamer reads their assignment
- **THEN** the nickname, blurb and trait chips are those of the catalog's dreamer profile
