# ADR-002: Tell, Don't Ask

**Status:** Accepted (2026-10-10)

## Context

When business rules live in services that read an aggregate's state and decide outside it, the same rule gets copied into each caller and the aggregate can be left in an invalid state.

## Decision

- Business logic lives in intention-named methods on the domain object itself (`distribution.assign(...)`), not in an orchestrator that reads state and decides.
- Application services only orchestrate: load → invoke the domain method → persist → pull events → dispatch.

## Consequences

Invariants are enforced in one place and are testable with plain unit tests. Application services stay thin enough to need no tests of their own (ADR-001).

## In this repo

- `EventDistribution.assign` (`api/src/ColorDistribution/Domain/EventDistribution.ts`) decides the color; `ColorDistribution/Application/ApplicationService.ts` `assign` only loads, calls it, saves and dispatches.
