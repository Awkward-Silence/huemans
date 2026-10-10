# ADR-007: Domain free of infrastructure

**Status:** Accepted (2026-10-10)

## Context

Framework and ORM decorators in domain classes tie the model to them. Unit tests then need the framework, and the model can't be moved or reasoned about on its own.

## Decision

- Classes in `Domain/` import nothing from NestJS, MikroORM, HTTP or the `Application`/`Infrastructure` layers.
- Database mapping is declared outside the domain (external schema), never inline in the class.

## Consequences

Domain unit tests run without booting anything. The mapping is slightly more verbose than decorators would be.

## In this repo

- `api/eslint.config.mjs` enforces it: `no-restricted-imports` on `src/**/Domain/**` rejects `@nestjs/*`, `@mikro-orm/*`, `**/Application/**` and `**/Infrastructure/**`, so `pnpm lint` fails on a violation.
- Mapping uses MikroORM `EntitySchema` in `Infrastructure/Persistence/MikroOrm/*Schema.ts` (e.g. `EventSchema.ts`). Ports live in `Domain/Port`.
