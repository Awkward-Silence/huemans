# Spec Delta

## Purpose

Lets attendees build a funny "I ..." sentence by picking one of three options, 5 times. The options come from one AI-generated sentence tree that the attendee app loads once at startup, with the bundled tree as fallback, so the step is instant and never depends on the AI.

## ADDED Requirements

### Requirement: Quiz announces the sentence question
The quiz response SHALL include a `sentence` object with the question `id`, the `starter` word "I" and the number of `picks` (5). The sentence question SHALL come after all multiple-choice questions. Clients that ignore the field SHALL keep working.

#### Scenario: Quiz includes the sentence question
- **WHEN** an attendee fetches the quiz of an existing event
- **THEN** the response contains the multiple-choice questions and a `sentence` object with an id, starter "I" and picks 5

### Requirement: Serve the whole sentence tree in one call
`GET /sentence-tree` SHALL return `200` with `{ id, starter, picks, options }` in the shape of `tools/src/sentences/sentences.test.json`: starter "I", 5 picks, exactly 3 options at every pick, each option with an `id` (its 1-based path, "2.1.3"), `text`, `trait` and `next` (empty at the last pick). There is no per-word suggestion endpoint.

#### Scenario: Complete tree
- **WHEN** a client requests the sentence tree and one is available
- **THEN** the response is `200` with 243 sentences, one per path from the root to a leaf

### Requirement: The tree is generated once with the AI
The API SHALL generate the tree with one structured LLM call (Claude through Mastra, key in `ANTHROPIC_API_KEY`), using a prompt kept in the source code that asks for funny, catchy, family-friendly sentences in the app's tone. It SHALL start the generation at boot, serve the same tree for the life of the process, and let concurrent requests share one generation. A failed generation SHALL NOT be cached.

#### Scenario: Request during the generation
- **WHEN** a client requests the tree while the boot generation is still running
- **THEN** the request waits for that generation and no second model call is made

#### Scenario: Generation failed earlier
- **WHEN** a previous generation failed and a client requests the tree
- **THEN** the API tries a new generation

### Requirement: Generated trees are usable
Each option text SHALL be 1 to 30 characters of letters, inner spaces, apostrophes or hyphens, and its trait SHALL be one of the 33 shared-kernel traits. The API SHALL keep the first 3 usable options of each pick, skipping options with invalid text or trait, repeated sibling text (ignoring case) or incomplete next picks. When a pick has fewer than 3 usable options the generation is retried once.

#### Scenario: Extra and invalid options
- **WHEN** the model returns 4 options for a pick, one with an unknown trait
- **THEN** the tree keeps the first 3 usable ones

### Requirement: No tree without the AI
When no tree can be generated (no `ANTHROPIC_API_KEY`, provider error, unusable output after the retry), `GET /sentence-tree` SHALL answer `503`. The attendee app SHALL then use its bundled tree.

#### Scenario: No key configured
- **WHEN** the API runs without `ANTHROPIC_API_KEY`
- **THEN** `GET /sentence-tree` answers `503` at once and no model call is made

### Requirement: The sentence counts as one answer, weighed by Jev
On submit, the finished sentence SHALL be sent as `{ question, answer }` and Participation SHALL let Jev weigh its traits ([ADR-012](../../../../../docs/architecture/adr/ADR-012-ai-weighs-answers-on-submit.md)). The sentence SHALL be worth one answer in total, spread over the traits Jev finds, so it can tip a close call but not override the multiple-choice answers. The `trait` of each tree option SHALL NOT feed the trait profile: the tree's traits (chosen when the tree is generated) and Jev's weighing (probabilities over the finished sentence) stay separate, so the two can be compared. Submitting the quiz SHALL never wait on the sentence tree.

#### Scenario: Jev weighs the sentence
- **WHEN** an attendee submits a finished sentence and Jev answers within its timeout
- **THEN** the sentence adds one answer's worth of traits to the attendee's profile

#### Scenario: Jev unavailable
- **WHEN** Jev has no key, times out or fails
- **THEN** the sentence adds no traits and the multiple-choice answers decide alone

#### Scenario: Skipped sentence
- **WHEN** an attendee skips the sentence question
- **THEN** the quiz is submitted with `sentence: null` and the multiple-choice answers decide alone

#### Scenario: Submit while the tree is loading
- **WHEN** the sentence tree request is still in flight and the quiz is submitted
- **THEN** the submit is sent immediately and its result does not depend on the tree

### Requirement: Attendee builds the sentence one word at a time
After the multiple-choice questions, the attendee app SHALL show the sentence so far and the 3 options of the sentence tree for the next pick. Tapping a word SHALL append it and show the next 3 words, until all picks are made. The attendee SHALL be able to skip the question. Picks SHALL survive a reload.

#### Scenario: Building the sentence
- **WHEN** an attendee taps an option at each of the 5 picks
- **THEN** the screen shows the full sentence of "I" plus the 5 picked words and the quiz is submitted

#### Scenario: Skipping
- **WHEN** an attendee taps skip on the sentence question
- **THEN** the quiz is submitted with the multiple-choice answers and no sentence

#### Scenario: Reload mid-sentence
- **WHEN** an attendee reloads the page after picking 2 words
- **THEN** the sentence question shows the 2 picked words and continues from pick 3

### Requirement: The attendee app loads the tree once, with fallbacks
The attendee app SHALL request the tree once at startup and retry a failed request 3 times with growing delays. When the sentence step opens, the app SHALL choose its tree once: the loaded tree if it arrived; the bundled tree if loading failed; and, if loading is still running, the loaded tree if it arrives within 400 ms, otherwise the bundled tree, cancelling the request. The chosen tree SHALL NOT change while the attendee builds the sentence.

#### Scenario: Tree already loaded
- **WHEN** the tree arrived before the attendee reaches the sentence step
- **THEN** the step shows the generated tree's options with no loading state

#### Scenario: Loading already failed
- **WHEN** every attempt failed before the attendee reaches the sentence step
- **THEN** the step shows the bundled tree's options at once

#### Scenario: Still loading
- **WHEN** the request is still running 400 ms after the sentence step opened
- **THEN** the step shows the bundled tree's options, the request is cancelled and not retried

### Requirement: Finished sentence is shown back
The attendee app SHALL show the finished sentence to the attendee on the reveal screen. The sentence SHALL stay on the attendee's phone and SHALL NOT be sent with the quiz answers.

#### Scenario: Sentence on the reveal
- **WHEN** an attendee who finished the sentence reaches the reveal screen
- **THEN** their sentence is shown alongside their color

#### Scenario: Skipped sentence
- **WHEN** an attendee who skipped the sentence reaches the reveal screen
- **THEN** the reveal screen shows no sentence and nothing is missing
