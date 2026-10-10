# ADR-010: Explicit optionality in the domain

**Status:** Accepted (2026-10-10)

## Context

A silent `null` returned from a domain getter is easy to forget to handle.

## Decision

- When a domain getter returns genuinely optional data, the domain makes that explicit (an `Option`/`Maybe` type) instead of a silent `null`.
- The explicitness stays inside the domain. At the application boundary (DTOs, ORM, views) it converts back to a plain optional type. The monadic type never leaks out.

## Consequences

Callers inside the domain are forced to handle absence. The boundary stays plain TypeScript.

## In this repo

- Not used yet. Today, repository ports return `T | null` (e.g. `EventRepository.search`), which TypeScript's strict null checks already force callers to handle. Adopt an `Option` type when optional data appears on domain getters.
