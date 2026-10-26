# ADR-011: Typed validation at the edge

**Status:** Accepted (2026-10-10)

## Context

Hand-written validation spread across handlers is easy to skip and lets malformed input reach the domain as unexpected errors.

## Decision

- Every entry point that accepts external input (HTTP, CLI, message) validates it with a typed payload object that declares its rules in one place.
- The validated payload is handed to the application service. The entry point itself is reduced to minimal orchestration.
- Domain value objects still guard their own invariants (ADR-003). Edge validation is about shape and type.

## Consequences

Bad input is rejected with `400` before reaching the domain, and the payload type matches `api/contracts/`.

## In this repo

- `ZodValidationPipe` (`api/src/Shared/Infrastructure/Http/ZodValidationPipe.ts`), e.g. `CreateEventPayload` in `EventController`.
- `UuidV7Param` (`api/src/Shared/Infrastructure/Http/UuidV7Param.ts`) for path ids.
