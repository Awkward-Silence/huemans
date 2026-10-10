# ADR-003: Value objects instead of primitives

**Status:** Accepted (2026-10-10)

## Context

A raw `string` for a name or an id can't enforce its own rules, so validation spreads to every caller and two different concepts with the same primitive type can be mixed up.

## Decision

- No domain concept (name, quantity, email, id…) is a raw `string`/`number`/`boolean` inside the model. It is wrapped in an immutable value object that validates its invariant on construction.
- Primitives are allowed only at the outer edge (payloads, DTOs, contracts).
- A concept made of several related fields (address, contact, money) is one composite value object, with a private constructor, a named factory and cross-field validation in one place. It is never flattened into loose fields on the aggregate.

## Consequences

Invalid values can't exist inside the domain, and the type checker separates `EventId` from `AttendeeId`. The cost is some extra classes, plus column types to map them (`VO.*`).

## In this repo

- Base classes in `api/src/Shared/Domain/ValueObject/` (`StringValueObject`, `Uuid`, `EnumValueObject`, …) and `Collection` in `api/src/Shared/Domain/Collection.ts`.
- `EventName` (trimmed, 1–255 characters), `TraitProfile` (a non-empty trait collection with its own behaviour), and `Color`.
- Persistence maps them with `VO.uuid/string/number/enum` from `api/src/Shared/Infrastructure/Persistence/MikroOrm/Types`.
