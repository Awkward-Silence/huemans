# Spec Delta

## Purpose

Lets attendees build a funny "I ..." sentence by picking one of three AI-suggested words at each step, fast enough to feel instant and with fallbacks so the quiz never stalls or depends on the AI.

## ADDED Requirements

### Requirement: Quiz announces the sentence question
The quiz response SHALL include a `sentence` object with the question `id`, the `starter` word "I" and the number of `picks` (4). The sentence question SHALL come after all multiple-choice questions. Clients that ignore the field SHALL keep working.

#### Scenario: Quiz includes the sentence question
- **WHEN** an attendee fetches the quiz of an existing event
- **THEN** the response contains the multiple-choice questions and a `sentence` object with an id, starter "I" and picks 4

#### Scenario: Old client ignores the field
- **WHEN** a client that does not know the `sentence` field reads the quiz
- **THEN** it can still show and submit the multiple-choice questions unchanged

### Requirement: Suggest three next words for a sentence
`POST /events/:eventId/questions/:questionId/word-suggestions` with `{ attendeeId, sentence }` SHALL return `200` with `{ words, source }`, where `words` holds exactly 3 next words and `source` is `"ai"` or `"fallback"`. `sentence` is the words so far, starting with the starter.

#### Scenario: First step
- **WHEN** an attendee requests suggestions with sentence `["I"]`
- **THEN** the response is `200` with exactly 3 words and a `source` of `"ai"` or `"fallback"`

#### Scenario: Later step
- **WHEN** an attendee requests suggestions with sentence `["I", "secretly", "lick"]`
- **THEN** the response is `200` with exactly 3 words that continue that sentence

### Requirement: Suggested words are usable
Each suggested word SHALL be a single word of 1 to 20 characters made of letters, apostrophes or hyphens. The 3 words SHALL be distinct, ignoring case, and none SHALL repeat a word already in the sentence. The system SHALL replace AI output that breaks these rules with fallback words.

#### Scenario: Invalid model output is replaced
- **WHEN** the AI returns a phrase with spaces, a duplicate word, or fewer than 3 words
- **THEN** the response still contains 3 valid words and the invalid ones are replaced by fallback words

### Requirement: Suggestions never fail because of the AI
The endpoint SHALL answer with 3 words and status `200` when the AI provider times out, errors, is not configured, or the attendee exceeds the rate limit. In those cases the words SHALL come from the static fallback and `source` SHALL be `"fallback"`.

#### Scenario: Provider error
- **WHEN** the AI provider returns an error
- **THEN** the response is `200` with 3 fallback words and `source` `"fallback"`

#### Scenario: No API key configured
- **WHEN** the API runs without an AI provider key
- **THEN** every suggestion request is answered with fallback words

#### Scenario: Rate limit exceeded
- **WHEN** one attendee sends more suggestion requests in a minute than the per-attendee limit allows
- **THEN** the extra requests are answered with `200` and fallback words, not an error

### Requirement: Suggestions answer within a bounded time
The endpoint SHALL respond within 1.2 seconds of receiving a valid request, whatever the AI provider's latency. An AI call still running after 1 second SHALL be abandoned for that response, and fallback words SHALL be served.

#### Scenario: Slow provider
- **WHEN** the AI provider takes 5 seconds to answer
- **THEN** the endpoint responds within 1.2 seconds with fallback words

#### Scenario: Repeated prefix is served from cache
- **WHEN** a sentence prefix of an event's question already got AI suggestions and another request for the same prefix arrives
- **THEN** the response has `source` `"ai"` and does not wait on a new AI call

### Requirement: Invalid suggestion requests are rejected
The endpoint SHALL return `404` for an unknown event or a `questionId` that is not the event's sentence question. It SHALL return `400` when `attendeeId` is missing, the sentence does not start with the starter, an entry is not a valid word, or the sentence already has all its picks.

#### Scenario: Unknown event
- **WHEN** suggestions are requested for an event that does not exist
- **THEN** the response is `404`

#### Scenario: Wrong starter
- **WHEN** suggestions are requested with sentence `["You", "eat"]`
- **THEN** the response is `400`

#### Scenario: Sentence already complete
- **WHEN** suggestions are requested for a sentence with the starter and 4 picked words
- **THEN** the response is `400`

### Requirement: Funny prompt is editable without a code change
The instructions that tell the AI how to suggest funny words SHALL be read from a configurable prompt file. After the file changes, new AI suggestions SHALL use the new prompt, and suggestions cached under the old prompt SHALL no longer be served.

#### Scenario: Prompt edited on a running server
- **WHEN** an operator edits the prompt file while the API is running
- **THEN** the next suggestion request that reaches the AI uses the edited prompt, without a restart or redeploy

### Requirement: The sentence is fun only
The sentence SHALL carry no trait. It SHALL NOT affect the attendee's trait profile, personality type or color group. Submitting the quiz SHALL never wait on a word suggestion.

#### Scenario: Grouping ignores the sentence
- **WHEN** two attendees give the same multiple-choice answers and build different sentences
- **THEN** both get the same trait profile and personality type

#### Scenario: Submit while a suggestion is pending
- **WHEN** a suggestion request is still in flight and the quiz is submitted
- **THEN** the submit is sent immediately and its result does not depend on the suggestion

### Requirement: Attendee builds the sentence one word at a time
After the multiple-choice questions, the attendee app SHALL show the sentence so far and 3 suggested words. Tapping a word SHALL append it and show the next 3 words, until all picks are made. The attendee SHALL be able to skip the question. Picks SHALL survive a reload.

#### Scenario: Building the sentence
- **WHEN** an attendee taps a suggested word at each of the 4 steps
- **THEN** the screen shows the full sentence of "I" plus the 4 picked words and the quiz is submitted

#### Scenario: Skipping
- **WHEN** an attendee taps skip on the sentence question
- **THEN** the quiz is submitted with the multiple-choice answers and no sentence

#### Scenario: Reload mid-sentence
- **WHEN** an attendee reloads the page after picking 2 words
- **THEN** the sentence question shows the 2 picked words and continues from step 3

### Requirement: Next words appear without waiting
While 3 words are shown, the attendee app SHALL request the follow-up suggestions for each of them in parallel, so the next step can show without a new round trip. If suggestions fail or take longer than 1.5 seconds, the app SHALL show its own fallback words.

#### Scenario: Prefetched step
- **WHEN** an attendee taps a word whose follow-up suggestions already arrived
- **THEN** the next 3 words show immediately, with no loading state

#### Scenario: API unreachable
- **WHEN** the suggestion request fails with a network error
- **THEN** the app shows 3 fallback words and the attendee can keep building the sentence

### Requirement: Finished sentence is shown back
The attendee app SHALL show the finished sentence to the attendee on the reveal screen. The sentence SHALL stay on the attendee's phone and SHALL NOT be sent with the quiz answers.

#### Scenario: Sentence on the reveal
- **WHEN** an attendee who finished the sentence reaches the reveal screen
- **THEN** their sentence is shown alongside their color

#### Scenario: Skipped sentence
- **WHEN** an attendee who skipped the sentence reaches the reveal screen
- **THEN** the reveal screen shows no sentence and nothing is missing
