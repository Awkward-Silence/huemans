## ADDED Requirements

### Requirement: Catalog content is seeded from the content files
The system SHALL load the questions and icebreakers from the catalog content files (`tools/src/questions/questions.test.json` and `tools/src/icebreakers/icebreakers.test.json` by default, or paths given to the seed command) into its database. Both files SHALL be validated against the schemas in `api/src/Types/` before anything is written; if either file is invalid, nothing SHALL be written. Seeding SHALL be repeatable: running it again with the same files SHALL leave the catalog unchanged, and running it with an edited file SHALL update the existing entries by id. Entries that disappear from a file SHALL be kept, so events that already use them keep working.

#### Scenario: First seed loads all content
- **WHEN** the seed command runs on an empty catalog with the current content files
- **THEN** the catalog contains 50 questions with 4 answers each and 51 icebreakers

#### Scenario: Invalid file writes nothing
- **WHEN** the seed command runs with a questions file in which one answer has a trait outside the 33 traits
- **THEN** the command fails, names the invalid entry, and the catalog is unchanged

#### Scenario: Seeding twice changes nothing
- **WHEN** the seed command runs twice with the same files
- **THEN** the catalog still contains exactly 50 questions and 51 icebreakers, with the same content

#### Scenario: Edited text updates the entry
- **WHEN** the text of question `q0001` is changed in the file and the seed command runs again
- **THEN** question `q0001` has the new text and keeps its id and answers

#### Scenario: Removed entry is kept
- **WHEN** a question that was seeded before is missing from the file and the seed command runs again
- **THEN** that question is still in the catalog

### Requirement: Questions are readable with their answers
The system SHALL let other contexts read questions with their theme, text and exactly four answers, each answer with its id, text and trait. Listing all questions SHALL return them ordered by id, with answers in the order of the content file. Reading questions by id SHALL return them in the requested order and SHALL report which requested ids do not exist.

#### Scenario: List all questions
- **WHEN** a context lists the questions of a seeded catalog
- **THEN** it receives 50 questions ordered by id, each with 4 answers in file order and the trait of each answer

#### Scenario: Read selected questions in order
- **WHEN** a context reads questions `q0007`, `q0001` and `q0042`
- **THEN** it receives those three questions in that order

#### Scenario: Unknown question id
- **WHEN** a context reads questions `q0001` and `q9999`
- **THEN** the read reports `q9999` as not found

### Requirement: The trait behind an answer can be resolved
The system SHALL resolve a list of (question id, answer id) pairs to the traits of those answers, one trait per pair, repeats kept. A pair whose question or answer does not exist, or whose answer belongs to another question, SHALL be ignored.

#### Scenario: Resolve chosen answers
- **WHEN** a context resolves the pairs (`q0001`, `q0001-c`) and (`q0002`, `q0002-a`)
- **THEN** it receives the two traits of those answers, in that order

#### Scenario: Unknown or mismatched pair is ignored
- **WHEN** a context resolves (`q0001`, `q0001-c`), (`q0001`, `q0002-a`) and (`q9999`, `q9999-a`)
- **THEN** it receives only the trait of `q0001-c`

### Requirement: Icebreakers are readable
The system SHALL let other contexts list all icebreakers, ordered by id, each with its theme, text and one to three distinct traits.

#### Scenario: List all icebreakers
- **WHEN** a context lists the icebreakers of a seeded catalog
- **THEN** it receives 51 icebreakers ordered by id, each with its theme, text and traits

### Requirement: Every trait belongs to exactly one personality type
The catalog SHALL define the trait-to-type mapping: each of the 33 traits maps to exactly one of the 4 personality types. Color distribution SHALL use this mapping to derive an attendee's personality type, in place of the provisional mapping.

#### Scenario: Mapping covers every trait
- **WHEN** color distribution asks the catalog for the trait-to-type mapping
- **THEN** it receives a mapping in which each of the 33 traits has exactly one personality type, and every personality type has at least one trait

#### Scenario: Distribution uses the catalog mapping
- **WHEN** an attendee completes the questionnaire with traits that all map to planner in the catalog mapping
- **THEN** the attendee is assigned with personality type planner

### Requirement: Reveal chips match the personality type
The trait chips shown at the reveal for a personality type SHALL all map to that same personality type in the catalog mapping.

#### Scenario: Chips belong to their type
- **WHEN** the reveal copy of each personality type is checked against the catalog mapping
- **THEN** every chip trait of a type maps to that type
