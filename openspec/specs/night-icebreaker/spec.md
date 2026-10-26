# night-icebreaker Specification

## Purpose

Lets the host reveal the event and gives every attendee and the host screen the same single icebreaker for the night, picked from the traits of the people who answered.

## Requirements

### Requirement: Host reveals the event
The system SHALL expose `POST /events/:eventId/reveal`. On an open event it SHALL move the event to `revealed` and respond `200` with the event body (the same shape as `GET /events/:eventId`, with `status: "revealed"`). On an event that is already revealed it SHALL respond `200` with the same body and change nothing: the icebreaker is not picked again. It SHALL respond `404` for an unknown event and `400` when the id is not a UUIDv7.

#### Scenario: Reveal an open event
- **WHEN** the host posts to `/events/:eventId/reveal` for an open event
- **THEN** the response is `200` with `status: "revealed"`, and `GET /events/:eventId` returns `status: "revealed"`

#### Scenario: Second reveal is a no-op
- **WHEN** the host posts to `/events/:eventId/reveal` twice for the same event
- **THEN** both responses are `200` with `status: "revealed"`, and the night's icebreaker after the second call is the same as after the first

#### Scenario: Unknown event
- **WHEN** the host posts to `/events/:eventId/reveal` with a UUIDv7 that matches no event
- **THEN** the response is `404`

#### Scenario: Invalid id
- **WHEN** the host posts to `/events/not-a-uuid/reveal`
- **THEN** the response is `400`

### Requirement: Room traits are collected as attendees complete the quiz
The system SHALL keep, per event, the weighted traits of every attendee who completed the questionnaire, as carried by their questionnaire completion (answer traits and the sentence traits Jev weighed). Each attendee SHALL count once per event, even when they submit again.

#### Scenario: Submitted traits count towards the room
- **WHEN** an attendee submits answers whose traits are `curious` and `analytical`
- **THEN** those traits, with their weights, are part of that event's room traits

#### Scenario: Repeated submission counts once
- **WHEN** the same attendee submits answers twice to the same event
- **THEN** that attendee's traits count once in the room traits

### Requirement: The night's icebreaker matches the room
When an event is revealed, the system SHALL pick exactly one catalog icebreaker for it: the one whose traits have the highest summed room weight, where a trait's room weight is the sum of its weights over every attendee who completed the questionnaire before the reveal. Ties SHALL go to the lowest icebreaker id. When no attendee has completed the questionnaire, the icebreaker with the lowest id SHALL be picked. The pick SHALL be stored once, with its question, an explanation of why it was picked and the time it was picked, and SHALL NOT change afterwards: attendees who complete the questionnaire after the reveal SHALL NOT change it.

#### Scenario: Icebreaker follows the room's strongest traits
- **WHEN** every attendee who answered before the reveal leans `adventurous` and `humorous`, and the event is revealed
- **THEN** the night's icebreaker is the catalog icebreaker whose traits have the highest summed weight in that room

#### Scenario: Tie goes to the lowest id
- **WHEN** two icebreakers have the same summed room weight, and that weight is the highest
- **THEN** the one with the lowest icebreaker id is picked

#### Scenario: Empty room still gets an icebreaker
- **WHEN** an event with no completed questionnaires is revealed
- **THEN** the night's icebreaker is the catalog icebreaker with the lowest id

#### Scenario: Late completion does not change the icebreaker
- **WHEN** an attendee completes the questionnaire after the event was revealed
- **THEN** the attendee is still grouped, and the night's icebreaker stays the same

### Requirement: Attendees read the night's icebreaker
The system SHALL expose `GET /events/:eventId/attendees/:attendeeId/icebreaker`, polled by the attendee app. It SHALL respond `200 { "status": "locked" }` while the event is not revealed, and also while the attendee has no group yet. Once the event is revealed and the attendee has a group, it SHALL respond `200` with `status: "ready"`, `question` (the icebreaker text, the same for every attendee of the event), `why` (one sentence on why it was picked, the same for every attendee), `meetingSpot` (a fixed place for the attendee's color) and `gatherEndsAt` (ISO 8601 UTC, the pick time plus 120 seconds, the same for every attendee). It SHALL respond `404` for an unknown event and `400` when an id is not a UUIDv7.

#### Scenario: Locked before the reveal
- **WHEN** a grouped attendee reads the icebreaker of an open event
- **THEN** the response is `200 { "status": "locked" }`

#### Scenario: Ready after the reveal
- **WHEN** a grouped attendee reads the icebreaker after the event was revealed
- **THEN** the response is `200` with `status: "ready"`, a non-empty `question`, a `why`, the meeting spot of the attendee's color and `gatherEndsAt` 120 seconds after the reveal

#### Scenario: Every attendee gets the same icebreaker and countdown
- **WHEN** two attendees with different colors read the icebreaker of the same revealed event
- **THEN** both get the same `question`, `why` and `gatherEndsAt`, and each gets the meeting spot of their own color

#### Scenario: Locked for an attendee without a group
- **WHEN** an attendee who has not submitted answers reads the icebreaker of a revealed event
- **THEN** the response is `200 { "status": "locked" }`

#### Scenario: Late joiner gets it once grouped
- **WHEN** an attendee submits answers after the reveal and then reads the icebreaker
- **THEN** the response is `ready` with the icebreaker picked at the reveal

#### Scenario: Unknown event
- **WHEN** an attendee reads the icebreaker of a UUIDv7 that matches no event
- **THEN** the response is `404`

### Requirement: Host screen reads the night's icebreaker
The system SHALL expose `GET /events/:eventId/icebreaker` for the host screen, with no attendee. It SHALL respond `200 { "status": "locked" }` while the event is not revealed, and `200` with `status: "ready"`, `question`, `why` and `gatherEndsAt` (the same values attendees get) once it is revealed. It SHALL respond `404` for an unknown event and `400` when the id is not a UUIDv7.

#### Scenario: Host sees locked before the reveal
- **WHEN** the host screen reads the icebreaker of an open event
- **THEN** the response is `200 { "status": "locked" }`

#### Scenario: Host sees the same icebreaker as attendees
- **WHEN** the host screen reads the icebreaker of a revealed event
- **THEN** the response is `ready` with the same `question`, `why` and `gatherEndsAt` that attendees get

### Requirement: Revealing never waits on AI
Picking the icebreaker and reading it SHALL NOT call an AI model. The `why` sentence SHALL come from a static explanation that names the room's strongest traits among the icebreaker's traits, so a later AI explanation can replace it behind the same slot with this one as its fallback.

#### Scenario: Reveal works without an AI key
- **WHEN** the API runs with no AI key configured and the host reveals the event
- **THEN** the reveal succeeds and attendees get a `ready` icebreaker with a non-empty `why`
