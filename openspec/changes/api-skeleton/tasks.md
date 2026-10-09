# Tasks

## 1. Scaffold

- [ ] 1.1 Create `api/` with `package.json` (pnpm), `.nvmrc`, `nest-cli.json` (monorepo, project `api`), strict `tsconfig.json` with the `@Huemans/*` alias, ESLint and Prettier configs, and verify `pnpm install` and `pnpm build` succeed
- [ ] 1.2 Add `docker-compose.yml` (Postgres 17 with healthcheck and an init script creating `huemans` and `huemans_test`), `.env.example` and git-ignored `.env`/`.env.test`, and verify `docker compose up -d` reports the database healthy
- [ ] 1.3 Add `jest.config.ts` with the Unit, Integration and Functional projects and the scripts `test`, `test:unit`, `test:integration`, `test:functional`, and verify `pnpm test:unit` runs (no tests yet)

## 2. Shared kernel (unit tests first)

- [ ] 2.1 Implement `InvalidArgumentError`, `ValueObject`, `StringValueObject` and `NumberValueObject`, and verify unit tests for equality and rejection of missing values
- [ ] 2.2 Implement `EnumValueObject`, and verify unit tests accept listed values and reject others with `InvalidArgumentError`
- [ ] 2.3 Implement `Uuid` (version 7 only, `random()`), and verify unit tests accept a v7, reject a v4 and reject malformed strings
- [ ] 2.4 Implement `Collection<T>`, and verify unit tests for typed items, immutability and iteration
- [ ] 2.5 Implement `DomainEvent`, `AggregateRoot` (lazy event list, `record`, `pullDomainEvents`, abstract `toDTO`) and the `EventDispatcher` port, and verify unit tests including an aggregate created without its constructor

## 3. Shared infrastructure

- [ ] 3.1 Add the MikroORM Postgres config, the value-object column types and `MikroOrmRepository<T>`, and verify an integration test round-trips a value object through a test-only entity schema against `huemans_test`
- [ ] 3.2 Add `InMemoryEventDispatcher`, and verify an integration test that subscribers run in order and finish before `dispatchAll` resolves
- [ ] 3.3 Add `ZodValidationPipe` and `DomainErrorFilter`, and verify through functional tests in 4.2

## 4. App and health

- [ ] 4.1 Add `apps/api` (`main.ts`, `AppModule`, `config.ts`) and `DatabaseHealthProbe`, and verify an integration test that the probe reports the database up
- [ ] 4.2 Add `GET /health`, and verify functional tests for 200 `{"status":"ok","database":"up"}`, 503 `{"status":"error","database":"down"}` with the probe stubbed down, a 400 from the zod pipe and a 400 from `InvalidArgumentError` on test-only routes
- [ ] 4.3 Verify `pnpm start:dev` serves `/health` and the response changes to 503 when Postgres is stopped

## 5. Guardrails and docs

- [ ] 5.1 Add the `no-restricted-imports` rule for `src/**/Domain/**`, and verify a deliberate `@nestjs/common` import in a domain file fails `pnpm lint`, then remove it
- [ ] 5.2 Add migrations config and the `migration:create`/`migration:up` scripts (dev and test), and verify `pnpm migration:up` runs cleanly on an empty database
- [ ] 5.3 Document install, database, migration and test commands (all, one suite, one file, one test) in `CLAUDE.md`, and verify each command runs as written
