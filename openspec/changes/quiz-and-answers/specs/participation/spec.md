# Spec Delta

## Purpose

Lets people join an event with just a name, answer the event's quiz with a soft timer, and turns their answers into the trait profile that groups them, while keeping count of who joined and who answered.

## ADDED Requirements

### Requirement: Attendees join an event with a name
The system SHALL let anyone join an existing event with only a name, through `POST /events/:eventId/attendees` with `{ name }`. It SHALL answer `201` with `{ attendeeId }`, a UUIDv7 that identifies the attendee from then on. The name SHALL be trimmed and SHALL be 1 to 40 characters after trimming. Every call SHALL create a new attendee, even with a name already used in the event. Joining SHALL stay open after attendees start answering and after the event is revealed.

#### Scenario: Joining returns a new attendee id
- **WHEN** someone joins an open event with the name "Ana"
- **THEN** the response is `201` with an `attendeeId` that is a UUIDv7

#### Scenario: The same name joins twice
- **WHEN** two people join the same event with the name "Ana"
- **THEN** each gets a different `attendeeId`

#### Scenario: Joining after the reveal
- **WHEN** someone joins an event that has been revealed
- **THEN** the response is `201` with a new `attendeeId`

#### Scenario: Invalid name
- **WHEN** someone joins with a name that is empty, only spaces, longer than 40 characters after trimming, or missing
- **THEN** the response is `400` and no attendee is created

#### Scenario: Unknown event
- **WHEN** someone joins an event id that does not exist
- **THEN** the response is `404`

#### Scenario: Malformed event id
- **WHEN** someone joins with an event id that is not a UUIDv7
- **THEN** the response is `400`

### Requirement: Every phone gets the same quiz for an event
The system SHALL serve the event's quiz at `GET /events/:eventId/quiz` as `{ questions, durationSeconds }`. `questions` SHALL hold 5 catalog questions, each with its `id`, `theme`, `text` and its 4 answers (`id`, `text`) in catalog order. `durationSeconds` SHALL be 20, the soft timer for the whole quiz. Every request for the same event SHALL return the same questions in the same order, also after a restart, and different events SHALL generally get different questions. The 5 questions SHALL come from 5 different themes whenever the catalog has that many. Answers SHALL NOT expose their trait.

#### Scenario: Quiz shape
- **WHEN** an attendee fetches the quiz of an existing event
- **THEN** the response is `200` with 5 questions of 4 answers each and `durationSeconds` 20, and no answer carries a trait

#### Scenario: Same quiz on every phone
- **WHEN** the quiz of one event is fetched twice
- **THEN** both responses list the same question ids in the same order

#### Scenario: Different events
- **WHEN** the quizzes of several new events are fetched
- **THEN** not all of them list the same question ids

#### Scenario: Varied themes
- **WHEN** an attendee fetches the quiz of an existing event
- **THEN** its 5 questions have 5 different themes

#### Scenario: Revealed event
- **WHEN** an attendee fetches the quiz of a revealed event
- **THEN** the response is `200` with the same quiz as before the reveal

#### Scenario: Unknown event
- **WHEN** an attendee fetches the quiz of an event id that does not exist
- **THEN** the response is `404`, and a malformed event id is `400`

### Requirement: The quiz settings are the same for every event
The event read (`GET /events/:eventId`), event creation (`POST /events`) and the reveal (`POST /events/:eventId/reveal`) SHALL report the quiz settings as `questionCount` 5 and `quizDurationSeconds` 20, the same values the quiz serves.

#### Scenario: The event and its quiz agree
- **WHEN** an attendee reads an event and then its quiz
- **THEN** the event's `questionCount` equals the number of quiz questions and its `quizDurationSeconds` equals the quiz's `durationSeconds`

### Requirement: Only attendees who joined the event submit answers
The system SHALL accept answers at `POST /events/:eventId/attendees/:attendeeId/answers` only from an attendee who joined that event. An attendee id that never joined, or that joined a different event, SHALL be answered with `404` and SHALL NOT be grouped.

#### Scenario: Joined attendee submits
- **WHEN** an attendee who joined the event submits answers
- **THEN** the response is `200` with `status` "assigned", a color and a personality type

#### Scenario: Attendee who never joined
- **WHEN** answers are submitted for an attendee id that never joined
- **THEN** the response is `404` and the event's distribution is unchanged

#### Scenario: Attendee of another event
- **WHEN** an attendee who joined event A submits answers to event B
- **THEN** the response is `404`

### Requirement: Submitting answers groups the attendee once
Submitting answers SHALL turn each known answer into its trait, worth one answer, and SHALL ignore pairs with an unknown question or answer id. The optional "I ..." sentence SHALL be weighed as before (ADR-012), adding nothing when the weigher fails or times out. The timer SHALL be soft: a submission SHALL be accepted whatever its `elapsedMs`. The resulting trait profile SHALL be published so the attendee is grouped during the call, and the response SHALL carry the attendee's color and personality type. A second submission by the same attendee SHALL return the first group unchanged and SHALL NOT publish the profile again.

#### Scenario: Late submission
- **WHEN** a joined attendee submits with an `elapsedMs` far above the quiz's duration
- **THEN** the response is `200` with a group

#### Scenario: Unknown answer ids
- **WHEN** a joined attendee submits only answers with unknown question or answer ids
- **THEN** the response is `200` with one of the four colors

#### Scenario: Second submission
- **WHEN** a joined attendee submits a second time with different answers
- **THEN** the response carries the same color and personality type as the first, and the event's distribution counts the attendee once

### Requirement: The room counts who joined
The room read (`GET /events/:eventId/room`) SHALL report as `total` the number of attendees who joined the event, and as `answered` the number who have a group. An attendee who joined but has not submitted SHALL count in `total` only.

#### Scenario: Joined but not answered
- **WHEN** three attendees join an event and one of them submits answers
- **THEN** the room reads `total` 3 and `answered` 1

#### Scenario: Empty event
- **WHEN** nobody has joined an event
- **THEN** the room reads `total` 0 and `answered` 0
