# Proposal

## Why

Every other backend lane needs a running, deployed NestJS API with a database before it can start, and the content the game is built on (50 questions, 51 icebreakers) already exists only as JSON under `tools/`. Standing up the API and loading that content first unblocks Diego, Miguel and the distribution work within the first hours of the hackathon.

## What Changes

- Scaffold `api/` as a NestJS app with its own `package.json`, Postgres (docker-compose locally, managed instance in production), ORM with migrations, and a health endpoint.
- Set up the three test suites (Unit, Integration against a real database, Functional over HTTP).
- Deploy the empty API to its production URL so integration can start early.
- Add a seed command that imports `tools/src/questions/questions.test.json` and `tools/src/icebreakers/icebreakers.test.json`, validating them with the API's own schema (no runtime dependency on `tools/`).
- Define the four colors (RED, YELLOW, GREEN, BLUE), each with a name, a short description and a weight for every trait. These weights are the input to color distribution.

## Capabilities

### New Capabilities
- `catalog`: the read-only game content (questions with trait-tagged answers, icebreakers with themes and traits, and the four colors with descriptions and trait weights) and how it is loaded.

### Modified Capabilities

## Impact

- New `api/` application (NestJS, ORM, Postgres) and its deployment.
- Reads the `tools/` JSON files as the content contract. `tools/` itself is unchanged.
- Owner: Adrián (skeleton), Diego (catalog seed and colors).
