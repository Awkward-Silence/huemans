# Spec Delta

## Purpose

Makes a demo event with a fixed, known UUIDv7 available on any environment, so the web's demo link and QR code work against the real API.

## ADDED Requirements

### Requirement: Operator seeds the demo event
The system SHALL provide a seed command that creates the demo event with a fixed UUIDv7 and the name `Demo night`, through the same path as creating any event, so it starts `open` and its color distribution is opened. Running the command again SHALL change nothing.

#### Scenario: Seeding creates the demo event
- **WHEN** the seed command runs on a database without the demo event
- **THEN** `GET /events/:demoEventId` returns `200` with `name: "Demo night"` and `status: "open"`, and `GET /events/:demoEventId/room` returns four empty groups

#### Scenario: Seeding is idempotent
- **WHEN** the seed command runs a second time
- **THEN** the demo event is unchanged and `EventCreated` is not published again

### Requirement: Web demo link targets the seeded event against the API
The web SHALL open the demo event's fixed id from its demo link when running against the API, and keep the `demo` id when running on the in-browser mock.

#### Scenario: Demo link in HTTP mode
- **WHEN** the web runs with `VITE_API_MODE=http` and the demo event id configured
- **THEN** the home screen's demo link opens `/join/<demo event UUIDv7>`

#### Scenario: Demo link in mock mode
- **WHEN** the web runs with `VITE_API_MODE=mock` and no demo event id configured
- **THEN** the home screen's demo link opens `/join/demo`
