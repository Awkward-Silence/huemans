# Spec Delta

## MODIFIED Requirements

### Requirement: Content files hold only valid content
A question SHALL have a non-empty id, one of the 20 themes, a text that is not empty and at most 80 characters, and exactly 4 answers with ids unique within the question, each with a text that is not empty and at most 80 characters and one of the 33 traits. An icebreaker SHALL have a non-empty id, one of the 20 themes, a text that is not empty and at most 200 characters, and 1 to 3 distinct traits. There SHALL be exactly one profile per personality type, each with a nickname that, once surrounding whitespace is trimmed, is not empty and at most 80 characters, a blurb that is not empty and at most 200 characters, and exactly 3 distinct trait chips, each mapped to the profile's own type. The mapping SHALL place each of the 33 traits in exactly one of the 4 personality types.

#### Scenario: Question with a repeated answer id
- **WHEN** a question lists two answers with the id `q0001-a`
- **THEN** the content is rejected

#### Scenario: Missing profile
- **WHEN** the profiles file has no profile for dreamer
- **THEN** the content is rejected

#### Scenario: Unmapped trait
- **WHEN** the mapping file has no entry for `honest`
- **THEN** the content is rejected

#### Scenario: Question text too long
- **WHEN** a question's text has 81 characters
- **THEN** the content is rejected, naming the question

#### Scenario: Icebreaker text within its longer limit
- **WHEN** an icebreaker's text has 200 characters
- **THEN** the content is accepted

#### Scenario: Blurb too long
- **WHEN** a profile's blurb has 201 characters
- **THEN** the content is rejected, naming the profile

#### Scenario: Nickname is stored trimmed
- **WHEN** a profile's nickname is `"  The Planners  "`
- **THEN** the content is accepted and the profile's nickname reads `The Planners`

#### Scenario: Blank nickname
- **WHEN** a profile's nickname is only whitespace
- **THEN** the content is rejected, naming the profile

## ADDED Requirements

### Requirement: Catalog content is seeded once from the content files
The system SHALL load the catalog content from four JSON files kept in Catalog's own infrastructure into its database: the questions, the icebreakers, the personality type profiles and the trait-type mapping (default paths, or paths given to the seed command). Every entry SHALL be checked against the content rules, and each profile's trait chips SHALL be checked against the mapping, before anything is written; if any check fails, the command SHALL fail naming the file and the entry, and nothing SHALL be written. The seed SHALL run only once per database: the database SHALL record when it was seeded, and a later run SHALL change nothing and SHALL report that the catalog was already seeded. Content SHALL NOT be updated, replaced or removed by a later run; changing the content of a seeded database means recreating it.

#### Scenario: First seed loads all content
- **WHEN** the seed command runs on a database that was never seeded, with the current content files
- **THEN** the catalog contains 50 questions with 4 answers each, 51 icebreakers, 4 personality type profiles and a mapping of all 33 traits, and the database records when it was seeded

#### Scenario: Invalid file writes nothing
- **WHEN** the seed command runs with a questions file in which one answer has a trait outside the 33 traits
- **THEN** the command fails, names the file and the invalid entry, and the catalog is unchanged

#### Scenario: Profile chip mapped to another type writes nothing
- **WHEN** the seed command runs with a profiles file whose planner profile shows the chip `curious`, which the mapping places in explorer
- **THEN** the command fails, names the profile and the chip, and the catalog is unchanged

#### Scenario: A failed write leaves no partial content
- **WHEN** the content is valid but writing it fails part way
- **THEN** nothing is written, and the database is not recorded as seeded

#### Scenario: A second seed does nothing
- **WHEN** the seed command runs on a database that is already seeded, even with edited files
- **THEN** the command reports that the catalog was already seeded, and the catalog content and the recorded seed time are unchanged


### Requirement: Seeding announces the content it authored
When the seed writes the catalog, the system SHALL publish, after the content is stored, one event for each question authored (with the question id), one for each icebreaker authored (with the icebreaker id), and one for the personality types being defined. No event SHALL be published when the seed fails or when the database was already seeded.

#### Scenario: Events after the first seed
- **WHEN** the seed command seeds a database that was never seeded, with the current content files
- **THEN** 50 question-authored events, 51 icebreaker-authored events and 1 personality-types-defined event are published

#### Scenario: No events from a second seed
- **WHEN** the seed command runs on a database that is already seeded
- **THEN** no catalog event is published

### Requirement: Content files can be checked without seeding
The system SHALL offer a command that checks the four content files against the same rules as the seed, without connecting to or writing to any database. It SHALL report success with the number of entries checked, or fail naming the file and each invalid entry.

#### Scenario: Current content passes the check
- **WHEN** the check command runs with the current content files
- **THEN** it succeeds and reports 50 questions, 51 icebreakers, 4 profiles and 33 mapped traits

#### Scenario: Check names an invalid entry
- **WHEN** the check command runs with a questions file whose question `q0003` has an answer with the trait `grumpy`
- **THEN** it fails and names `q0003`, and no database is touched

## REMOVED Requirements

### Requirement: Catalog content is seeded from the content files
**Reason**: The seed now runs once per database and goes through the Catalog aggregates (model 2.0.0). Re-seeding no longer updates entries by key, replaces a question's answers or keeps entries missing from the files; the content files also moved out of `tools/` into Catalog's infrastructure. Replaced by "Catalog content is seeded once from the content files".
**Migration**: To change the content of a seeded database, recreate it and seed again. Databases seeded before this change are recorded as seeded by the migration that introduces the seed record, so their next seed does nothing.
