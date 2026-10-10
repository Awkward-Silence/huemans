# ADR-005: References between aggregates by id only

**Status:** Accepted (2026-10-10)

## Context

An aggregate that holds another aggregate as an object ties together transactions, loading and modules, especially across bounded contexts.

## Decision

- An aggregate never contains another aggregate as an object, above all one from another bounded context. It holds only that aggregate's typed id.
- Checking that the referenced id exists is the orchestrator's job, not the domain's.

## Consequences

Contexts stay independently persistable and replaceable. Existence checks show up explicitly in application services or ports.

## In this repo

- `EventDistribution` holds an `EventId` (shared kernel), never an `Event`.
- Cross-context lookups go through an exported application service or a port (e.g. the Event context exports `ApplicationService.eventOf`).
