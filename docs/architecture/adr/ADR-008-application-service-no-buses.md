# ADR-008: One ApplicationService per context, no command or query bus

**Status:** Accepted (2026-10-10)

## Context

Command/query buses with a handler per message add a layer of indirection that a small team and a small codebase don't need.

## Decision

- Each bounded context exposes a single `Application/ApplicationService.ts` with one public method per use case, write or read.
- Controllers and subscribers call that method directly: no Command/Query objects, no handlers.
- The application service only coordinates (load → domain method → persist → pull events → dispatch). It never holds business logic (ADR-002).
- Domain events that cross contexts go through a separate event dispatcher (one to many). That is not an internal command/query bus.

## Consequences

Use cases are easy to find and trace. If a context grows many use cases, its service grows too, which is a signal to split the context, not to add a bus.

## In this repo

- `api/src/Event/Application/ApplicationService.ts`, `api/src/ColorDistribution/Application/ApplicationService.ts`.
- Events go through `InMemoryEventDispatcher` (synchronous and in-process; no queue or background job); subscribers such as `OpenDistributionOnEventCreated` call the subscribing context's application service.
