# Spec Delta

## Purpose

Creates the event every attendee scans into and announces new events, so the other contexts can prepare for them before anyone joins.

## ADDED Requirements

### Requirement: Host creates an event
The system SHALL create an event from a name. The event SHALL get a new UUIDv7 id and start with status `open`. The response SHALL be `201` with the created event, in the same shape as reading it.

#### Scenario: Event is created open
- **WHEN** `POST /events` is called with `{ "name": "Demo night" }`
- **THEN** the response is `201` with `{ id, name: "Demo night", status: "open", questionCount: 5, quizDurationSeconds: 20 }`, and `id` is a UUIDv7

#### Scenario: Two events with the same name are different events
- **WHEN** two events are created with the same name
- **THEN** they get different ids

### Requirement: Event name is validated
The system SHALL trim surrounding whitespace from the name. It SHALL reject a create request with `400` and create nothing when the name is missing, is not text, or is empty or longer than 255 characters after trimming.

#### Scenario: Name is trimmed
- **WHEN** `POST /events` is called with `{ "name": "  Demo night  " }`
- **THEN** the created event's name is `Demo night`

#### Scenario: Blank name is rejected
- **WHEN** `POST /events` is called with `{ "name": "   " }`
- **THEN** the response is `400` and no event is created

#### Scenario: Missing name is rejected
- **WHEN** `POST /events` is called with `{}`
- **THEN** the response is `400` and no event is created

#### Scenario: Name at the limit is accepted
- **WHEN** `POST /events` is called with a name of exactly 255 characters
- **THEN** the response is `201`

#### Scenario: Name over the limit is rejected
- **WHEN** `POST /events` is called with a name of 256 characters
- **THEN** the response is `400` and no event is created

### Requirement: Anyone with the event id can read it
The system SHALL return an event by id as `200 { id, name, status, questionCount, quizDurationSeconds }`. This is the shape the attendee app reads on its intro screen. `questionCount` and `quizDurationSeconds` SHALL be the quiz settings, which are the same for every event (5 and 20). An unknown id SHALL return `404`, and an id that is not a UUIDv7 SHALL return `400`.

#### Scenario: Created event can be read
- **WHEN** an event is created and then `GET /events/:eventId` is called with its id
- **THEN** the response is `200` with the same body as the create response

#### Scenario: Unknown event is not found
- **WHEN** `GET /events/:eventId` is called with a UUIDv7 that no event has
- **THEN** the response is `404`

#### Scenario: Malformed id is rejected
- **WHEN** `GET /events/:eventId` is called with an id that is not a UUIDv7
- **THEN** the response is `400`

### Requirement: New events are announced to other contexts
The system SHALL publish `EventCreated { eventId }` exactly once per created event, after the event is stored. The contexts that react to it SHALL have done so before the create response is returned, so the event's color distribution is already open.

#### Scenario: Creating an event opens its distribution
- **WHEN** an event is created and then `GET /events/:eventId/distribution` is called with its id
- **THEN** the response is `200` with the four color groups, all empty

#### Scenario: Event is announced once
- **WHEN** an event is created
- **THEN** exactly one `EventCreated` carrying its id is published

#### Scenario: Rejected event is not announced
- **WHEN** a create request is rejected as invalid
- **THEN** no `EventCreated` is published
