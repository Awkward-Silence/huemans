# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

**huemans** is a meetup gamification web app that breaks the ice at events by splitting attendees into **color groups** and nudging them to socialize. It is being built by a team of 4 during a **24h hackathon**. `web/` has the attendee flow running against an in-browser mock backend; `api/` and `contracts/` don't exist yet. When `api/` is scaffolded, add its dev/build/lint/test (and single-test) commands here.

Plan and open decisions: `docs/next-steps.md`. Raw product brainstorm: `initial-raw-specs.md`.

## Product core (what the demo must do)

```
host screen shows QR -> attendee scans -> 20s multiple-choice quiz
  -> attendee assigned to a color group -> phone shows color (LED mode)
  -> host taps "gather" -> each group gets a meeting spot + icebreaker question
```

Grouping into colors is the core; 1:1 % matching, profile tags/infographics, after-event follow-up and "people you already know" are stretch goals. Attendees join anonymously (no login), so nothing may slow down the 20-second promise.

## Architecture

Everything is TypeScript. Each app has **its own `package.json` and `node_modules`** — no monorepo workspaces, no shared dependencies.

```
contracts/   types only: no package.json, no runtime imports
web/         React (Vite) — /join/:eventId (attendee), /host/:eventId (big screen)
api/         NestJS + Mastra, one Nest module per bounded context
```

- **Contracts:** `contracts/` holds REST DTOs and socket event names/payloads as plain TypeScript types. Apps consume them only with `import type ... from '../contracts/...'` so they are erased at compile time and need no package resolution. Never add a runtime import or dependency to `contracts/`. Runtime validation lives at each app's own boundary.
- **Bounded contexts (Nest modules in `api/`):** `event` (event + QR, join), `questionnaire` (question bank, 20s deadline, answers), `grouping` (color assignment — the core domain), `gathering` (gather broadcasts + WebSocket gateway), `agents` (Mastra).
- **Domain purity:** each module keeps a `domain/` folder free of NestJS decorators; Grouping is the one context modeled with full DDD + tests.
- **Key seam:** Questionnaire emits `QuestionnaireCompleted { eventId, attendeeId, answers[] }` on submit or deadline; Grouping consumes it and emits `AttendeeGrouped { eventId, attendeeId, color }`, which is pushed in realtime to the phone and the host screen.
- **Mastra runs inside the NestJS process**, provided by the `agents` module. Other modules depend only on ports (`GroupNamer`, `IcebreakerWriter`, `QuestionGenerator`), never on Mastra directly, and every port has a deterministic fallback.
- **Rule: agents enrich, they never decide or block.** No LLM call in the quiz-submit or grouping path — push the color first, enrich asynchronously (group name, tailored icebreaker, big-screen commentary). Question-bank generation runs offline before the event.

## Commands

`web/` (run inside `web/`; structure and recipes in `web/README.md`):

```
npm run dev                                   # Vite dev server; open /join/demo (mock API) or /dev/kitchen-sink
npm run build                                 # tsc -b + vite build
npm run typecheck | npm run lint | npm run format
npm test                                      # vitest run
npx vitest run src/features/join/steps.test.ts   # one file
npx vitest run -t "redirectFor"               # by test name
```

`VITE_API_MODE=mock|http` picks the in-browser mock or the real `api/` (`VITE_API_URL`). Theme tokens live in `web/src/theme/`, copy in `web/src/content/`, API schemas in `web/src/api/schemas.ts` (to move into `contracts/` once it exists).

## Spec-driven workflow

- **DDD discovery** (`/ddd-bc`, `/ddd-model`, configured in `ddd-config.yml`) writes bounded-context models to `docs/domain/`. Use it for Grouping; other contexts stay light.
- **OpenSpec** (`schema: spec-driven`): `openspec/specs/` is the source of truth, `openspec/changes/<name>/` holds in-flight changes. Lifecycle: `/opsx:explore` -> `/opsx:propose` -> `/opsx:apply` -> `/opsx:sync` -> `/opsx:archive`. Work is split as one change per team lane so changes can be applied in parallel.
- CLI: `openspec list`, `openspec list --specs`, `openspec show <change>`, `openspec status --change <name>`, `openspec validate`.
