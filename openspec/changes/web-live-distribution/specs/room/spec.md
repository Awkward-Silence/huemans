# Spec Delta

## Purpose

Gives attendee phones the live picture of one event while people join and answer: how many joined, how many answered, and how many members each color group has.

## ADDED Requirements

### Requirement: Attendee reads the room of an event
The system SHALL serve `GET /events/:eventId/room` with `200` and `{ eventId, total, answered, groups }`. `groups` SHALL hold exactly one entry `{ color, count }` per color, in the order amber, coral, teal, violet, including colors with no members. `count` SHALL be the number of the event's attendees with that color, `answered` SHALL be the sum of the counts, and `total` SHALL be the number of attendees who joined the event. Every number SHALL be a whole number of at least 0, and `answered` SHALL never exceed `total`.

#### Scenario: New event has an empty room
- **WHEN** an event has just been created and `GET /events/:eventId/room` is called
- **THEN** the response is `200` with `total: 0`, `answered: 0` and the four colors in order, each with `count: 0`

#### Scenario: Room reflects grouped attendees
- **WHEN** three attendees of the event have completed their questionnaire and been grouped into amber, coral and teal
- **THEN** the room shows `answered: 3` and counts 1, 1, 1, 0 for amber, coral, teal, violet

#### Scenario: Room only counts the requested event
- **WHEN** attendees are grouped in another event
- **THEN** the requested event's room does not count them

#### Scenario: Joined count until Participation exists
- **WHEN** the room is read before Participation records joins
- **THEN** `total` equals `answered`

### Requirement: Room of an unknown event is not found
The system SHALL answer `404` when the event does not exist, without reading any counts. It SHALL answer `400` when the event id is not a UUIDv7.

#### Scenario: Unknown event
- **WHEN** `GET /events/:eventId/room` is called with a UUIDv7 that no event has
- **THEN** the response is `404`

#### Scenario: Malformed event id
- **WHEN** `GET /events/not-a-uuid/room` is called
- **THEN** the response is `400`
