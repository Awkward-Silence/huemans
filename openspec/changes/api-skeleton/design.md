# Design

## Context

There is no backend code yet. The layout follows `~/projects/reverse-ddd` (NestJS CLI monorepo: bootstrap in `apps/`, business code in `src/<BC>/{Domain,Application,Infrastructure}`, MikroORM `EntitySchema` + value-object column types) and the architecture used in podium (ports in `Domain/Port`, one `ApplicationService` per bounded context, HTTP and persistence under `Infrastructure/`, events released by the aggregate and dispatched after saving, Unit/Integration/Functional suites against real Postgres). reverse-ddd is a Mongo spike and about half of its shared kernel does not compile, so only its base classes and MikroORM types are ported, fixed for Postgres. See `proposal.md` for motivation and `specs/service-health/spec.md` for the one observable behavior.

## Goals / Non-Goals

**Goals:**
- A layout every lane copies without discussion: `src/<BC>/Domain/{Port,ValueObject,Event}`, `Application/ApplicationService.ts`, `Infrastructure/{Http,Persistence/MikroOrm,<BC>Module.ts}`.
- A domain that imports nothing from NestJS or MikroORM, enforced by lint.
- A test harness where each suite runs on its own and integration/functional tests hit a real, isolated Postgres.

**Non-Goals:**
- Deployment, CI, observability (OpenTelemetry stays out until needed).
- Command/query buses, RabbitMQ, Elastic, Mongo — present in reverse-ddd, not wanted here.

## Decisions

**Layout.**
```
api/
  apps/api/src/      main.ts, app.module.ts, config.ts, Health/
  src/Shared/Domain/ AggregateRoot, DomainEvent, Collection, InvalidArgumentError,
                     Port/EventDispatcher, ValueObject/{ValueObject,StringValueObject,
                     NumberValueObject,EnumValueObject,Uuid}
  src/Shared/Infrastructure/ Persistence/MikroOrm/{config,MikroOrmRepository,Types/},
                     EventDispatcher/InMemoryEventDispatcher, Http/{ZodValidationPipe,DomainErrorFilter}
  tests/{Unit,Integration,Functional,Support}
  migrations/
```
PascalCase folders, as in both reference projects. Path alias `@Huemans/*` → `src/*`. Each bounded context exposes `Infrastructure/<BC>Module.ts`, binding `Domain/Port` interfaces to adapters through Symbol tokens; `AppModule` imports it. Alternative — a flat Nest app — rejected by the team to keep room for a second app (workers) later.

**Shared kernel fixes over reverse-ddd.**
- `AggregateRoot` initializes its event list lazily, because MikroORM hydrates entities without calling the constructor (reverse-ddd would crash on `pullDomainEvents()` for loaded aggregates). `toDTO()` is abstract, following the "one canonical DTO" convention.
- `Uuid` accepts only version 7 and offers `Uuid.random()`.
- `EnumValueObject` extends `ValueObject` (it did not in reverse-ddd) and throws `InvalidArgumentError`.
- `Collection<T>` is new (from podium): an immutable typed list, matching `collections: typed-class` in `ddd-config.yml`.
- `EventDispatcher` is a domain port; the bus-related files of reverse-ddd are not ported.

**Persistence: MikroORM 6 on Postgres.** `EntitySchema` per aggregate under `Infrastructure/Persistence/MikroOrm`, value objects stored through custom types built by `ValueObjectTypeFactory` (ported). `MikroOrmRepository<T>` gives `persist` + `flush` and the entity repository. `allowGlobalContext` stays off; HTTP requests get their own context from `@mikro-orm/nestjs`. Alternative — TypeORM — rejected: the team already has working MikroORM `EntitySchema` + VO types to port.

**Events: synchronous, in process.** The `ApplicationService` pulls events from the aggregate, saves it, then calls `EventDispatcher.dispatchAll(events)`. `InMemoryEventDispatcher` awaits each subscriber in turn, so a request returns after its consequences are applied (required by `color-distribution`). A queue is not needed for one Node process.

**Boundary validation and errors.** HTTP payloads are validated by zod schemas through `ZodValidationPipe` (400 on failure). `DomainErrorFilter` maps `InvalidArgumentError` to 400; anything else stays 500.

**Configuration.** `apps/api/src/config.ts` reads `DATABASE_URL` and `PORT` from the environment. `.env.example` is committed; `.env` and `.env.test` (pointing at `huemans_test`) are git-ignored; tests load `.env.test`.

**Database for development and tests.** `docker-compose.yml` runs `postgres:17-alpine` with a healthcheck; an init script creates `huemans` and `huemans_test`. No tables yet: the first migration ships with `color-distribution`.

**Tests (Jest 30 + ts-jest, supertest).** `jest.config.ts` defines three projects matching `tests/<Suite>/**/*.test.ts`, so `pnpm test:unit` needs no database. `tests/Support/integration.ts` boots a Nest testing module with MikroORM on `huemans_test` and clears the database before each test; `tests/Support/functional.ts` boots the full `AppModule` with `getJson`/`postJson` helpers. Each suite keeps its dependencies in `let` variables assigned in `beforeEach` (the Jest form of "dependencies as private properties set in `setUp()`"). Test names are camelCase. Clearing the database replaces per-test transaction rollback: MikroORM's request context makes wrapping HTTP requests in an outer transaction unreliable, and the data volume is tiny.

**Lint.** ESLint flat config (type-checked) and Prettier from reverse-ddd, plus `no-restricted-imports` on `src/**/Domain/**`: no `@nestjs/*`, `@mikro-orm/*`, `**/Application/**` or `**/Infrastructure/**`.

## Risks / Trade-offs

- [Clearing the database between tests is slower than rollback] → Tiny schema, few tests; revisit only if suites get slow.
- [Integration tests fail without Docker running] → `pnpm test:unit` is independent; the README/CLAUDE.md commands start Postgres first.
- [Two apps never materialize, so `apps/` is one extra folder] → Accepted for consistency with reverse-ddd.
