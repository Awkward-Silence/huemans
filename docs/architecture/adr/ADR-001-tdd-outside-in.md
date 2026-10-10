# ADR-001: TDD outside-in and test structure

**Status:** Accepted (2026-10-10)

## Context

Bugs in a 24h hackathon are found live on stage. Tests are the only safety net that keeps four people changing the same code at speed, and duplicated coverage costs time we don't have.

## Decision

- No implementation code without a failing test that demands it: red → minimal green → refactor. Every bug fix starts with a test that reproduces the bug.
- **Functional tests** cover the acceptance criteria end to end (HTTP, or the real entry point of the use case).
- **Unit tests** cover domain logic (aggregates, value objects) with no Nest, network, disk or database.
- **Integration tests** cover repositories and infrastructure adapters against the real Postgres, never a fake.
- No unit tests for application services when functional tests cover them, and none for payloads/DTOs: they have no logic of their own.
- Run the relevant test right after writing each class or method; don't stack unverified implementations.
- Test names are camelCase: `testRejectsABlankName`, never snake_case.
- A collaborator or fixture used by more than one test is set up once in `beforeAll`/`beforeEach`, not rebuilt inside each test.

## Consequences

Coverage sits where behaviour is observable. Application services are tested only through their entry points, so refactoring them doesn't break tests.

## In this repo

- `api/tests/Unit`, `api/tests/Integration`, `api/tests/Functional`, run with `pnpm test:unit | test:integration | test:functional`.
- `api/tests/Support/functional.ts` (`bootFunctional`, `getJson`, `postJson`) and `api/tests/Support/integration.ts` (`bootIntegration`, `clearDatabase`). `clearDatabase` plays the role DAMA's rollback plays in PHP projects: integration tests start from an empty database.
- `api/tests/Support/events.ts` (`recordPublished`) asserts which domain events a use case publishes.
