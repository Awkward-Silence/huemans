# ADR-006: Canonical DTOs at the boundary

**Status:** Accepted (2026-10-10)

## Context

Leaking domain objects to controllers, views or other contexts couples them to the model's internals and lets them call domain behaviour by accident.

## Decision

- Every aggregate exposes exactly one `toDTO()` that returns a flat, immutable view made of primitives only.
- No domain object crosses into presentation or application consumers: controllers, other contexts and external tests see DTOs only.

## Consequences

The domain can change shape without breaking HTTP responses. Wire types are declared once in `api/contracts/`.

## In this repo

- `AggregateRoot.toDTO()` is abstract; `Event.toDTO()` returns `EventView`, `EventDistribution.toDTO()` returns `EventDistributionView`.
- Controllers map views onto the `api/contracts/` types (`import type` only).
