# Proposal

## Why

Every backend lane (color distribution, participation, catalog, night icebreaker) needs a running NestJS app with Postgres, a shared kernel and a working Unit/Integration/Functional test harness before it can start. Building it once, with the layout and conventions the team will follow, unblocks all of them in the first hours of the hackathon.

## What Changes

- Scaffold `api/` as a NestJS CLI monorepo with its own `package.json`: the bootstrap lives in `apps/api`, business code in `src/<BoundedContext>/{Domain,Application,Infrastructure}`.
- Add the shared kernel base classes in `src/Shared/Domain`: aggregate root with recorded domain events, domain event, value objects (string, number, enum, UUIDv7), typed immutable collection, invalid-argument error, and the event dispatcher port.
- Add shared infrastructure: MikroORM on Postgres with value-object column types and a base repository (mapping kept outside the domain), a synchronous in-process event dispatcher, a zod validation pipe and a domain error filter.
- Add a health endpoint that reports whether the database is reachable.
- Add docker-compose Postgres (dev and test databases), migrations setup, ESLint/Prettier with a rule that keeps the domain free of framework imports, and the three test suites with their support helpers.
- Out of scope: deployment (hosting is still an open decision) and any bounded context (catalog stays in `backend-skeleton-and-catalog`).

## Capabilities

### New Capabilities
- `service-health`: reporting whether the API and its database are up.

### Modified Capabilities

## Impact

- New `api/` application and its tooling; first commands added to `CLAUDE.md`.
- Every other backend change builds on this layout; `color-distribution` paths are aligned to it.
- Owner: Adrián.
