# Spec Delta

## Purpose

Lets the team, the host screen and any hosting platform check that the API is running and can reach its database.

## ADDED Requirements

### Requirement: Health endpoint reports API and database status
The system SHALL answer `GET /health` with the API status and the database status. When the database is reachable it SHALL respond 200 with `{"status":"ok","database":"up"}`. When the database is not reachable it SHALL respond 503 with `{"status":"error","database":"down"}`.

#### Scenario: Database reachable
- **WHEN** a client requests `GET /health` and the database answers
- **THEN** the response is 200 with `{"status":"ok","database":"up"}`

#### Scenario: Database unreachable
- **WHEN** a client requests `GET /health` and the database does not answer
- **THEN** the response is 503 with `{"status":"error","database":"down"}`
