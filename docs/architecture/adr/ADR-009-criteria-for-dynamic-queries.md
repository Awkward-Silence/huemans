# ADR-009: Criteria for dynamic queries

**Status:** Accepted (2026-10-10)

## Context

A repository method per filter combination multiplies methods and pushes query logic into the domain port.

## Decision

- Frequent queries keep specific named repository methods (`search`, `byEvent`, …).
- Dynamic queries (any mix of filters, ordering and pagination) use a generic `Criteria` object that the infrastructure translates into the real query.

## Consequences

One escape hatch for dynamic queries, without growing ports for each use.

## In this repo

- Not used yet: every current query is a named method. Introduce `Criteria` in `Shared/Domain` with the first query that really needs dynamic filters.
