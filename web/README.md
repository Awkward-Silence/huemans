# huemans web

The attendee app: scan the QR, answer a 20-second quiz, get a colour, find your group. React + Vite + TypeScript, TanStack Router and Query, zod.

```bash
npm install
npm run dev          # http://localhost:5173/join/demo (mock backend, no api/ needed)
```

Useful dev URLs:

- `/join/demo`: the full attendee flow against the in-browser mock. Any event id works.
- `/dev/kitchen-sink`: every `ui/` component in every variant, plus theme and group switchers and a "reset the demo session" button.
- `?theme=daylight` on any URL: switch theme.

## Scripts

| Command                                          | What it does                                |
| ------------------------------------------------ | ------------------------------------------- |
| `npm run dev`                                    | Dev server with hot reload                  |
| `npm run build`                                  | Typecheck, then production build to `dist/` |
| `npm run preview`                                | Serve the production build                  |
| `npm run typecheck`                              | `tsc -b`                                    |
| `npm run lint`                                   | ESLint                                      |
| `npm run format`                                 | Prettier                                    |
| `npm test`                                       | Vitest, once                                |
| `npx vitest run src/features/join/steps.test.ts` | One test file                               |
| `npx vitest run -t "redirectFor"`                | Tests whose name matches                    |

## Configuration

Copy `.env.example` to `.env.local`. Everything is validated in `src/config.ts`.

| Variable                     | Default                 | Meaning                                                    |
| ---------------------------- | ----------------------- | ---------------------------------------------------------- |
| `VITE_API_MODE`              | `mock`                  | `mock` runs everything in the browser; `http` calls `api/` |
| `VITE_API_URL`               | `http://localhost:3000` | Base URL of `api/` in `http` mode                          |
| `VITE_DEFAULT_THEME`         | `default`               | Theme when the URL has no `?theme=`                        |
| `VITE_INTRO_AUTO_ADVANCE_MS` | `4500`                  | How long the intro plays before moving on                  |
| `VITE_LIVE_POLL_MS`          | `2000`                  | Polling interval for live data until realtime lands        |

The quiz length comes from the API (`quizDurationSeconds`), not from config. The mock uses 20 seconds (see `src/api/mock/mockClient.ts`).

## How the code is organised

```
src/
  app/        router, QueryClient, providers, app-wide loading/error screens
  routes/     TanStack file routes. Thin: guard, read params, render a screen.
  features/   one folder per part of the flow; screens live here
    join/       intro, name, the attendee session, the step order and guards
    quiz/       the quiz screen and its pure helpers
    grouping/   sorted (suspense), reveal
    gathering/  icebreaker, LED badge
  ui/         presentational components. No routes, no API, no copy.
  theme/      tokens, themes, and the bridge to CSS variables
  content/    every user-facing string
  api/        zod schemas, the ApiClient interface, mock + http clients, query hooks
  lib/        small generic helpers and hooks
  domain/     shared domain values (the group colours)
```

Rules of thumb:

- Screens compose `ui/` components. They never contain colours, font sizes, spacing or copy.
- `ui/` components read only CSS variables (`var(--…)`) and take everything else as props.
- Server data lives in TanStack Query. Client state that must survive a refresh lives in the session store (`features/join/session.ts`).
- Every API response is parsed with its zod schema before a component sees it.

## Recipes

**Add a theme.** Copy `src/theme/themes/daylight.ts`, change values, register it in `src/theme/themes/index.ts`. TypeScript and a dev-time zod check catch missing tokens. Try it with `?theme=<name>`.

**Change a colour, size or timing everywhere.** Edit the token in the theme file. Tokens become CSS variables named after their path: `color.textMuted` becomes `--color-text-muted`, `groups.teal.bg` becomes `--group-teal-bg`, `type.displayXL.size` becomes `--type-display-xl-size`.

**Add a type scale step.** Add the name to `TYPE_SCALE` in `src/theme/tokens.ts`, fill it in every theme, then use `<Text scale="newName">`.

**Draw something in the attendee's group colour.** Inside a `Screen group={color}` (or any element with `style={groupVars(color)}`), use `var(--group-bg)`, `--group-ink`, `--group-ink-soft` and `--group-text`. The same component then works for every group.

**Add a group colour.** Add it to `GROUP_COLORS` in `src/domain/groupColor.ts`, then fill it in each theme's `groups` and in `content/en.ts` `groups`. The compiler lists every place that needs it.

**Change copy.** Edit `src/content/en.ts`. Strings that depend on data are functions, e.g. `copy.quiz.nudge(seconds)`.

**Add a screen or step.** Add it to `STEP_ROUTES` in `src/features/join/steps.ts` (and to the right stage in `STEPS_BY_STAGE`), create the screen under `features/`, then add a thin route file under `src/routes/join/$eventId/` that uses `guardStep`. Move between steps with `useGoToStep(eventId)` or `<ButtonLink to={STEP_ROUTES.x} params={{ eventId }}>`.

**Switch from the mock to the real backend.** Set `VITE_API_MODE=http` and `VITE_API_URL`. Endpoints are in `src/api/httpClient.ts`, shapes in `src/api/schemas.ts`. When `contracts/` exists, check these schemas against it with `import type` (see the note at the top of `schemas.ts`).

**Replace polling with realtime.** Keep the hooks in `src/api/queries.ts`. Subscribe to socket events once (e.g. in the join layout route) and write them into the cache with `queryClient.setQueryData(queryKeys.room(eventId), …)`, then drop the `refetchInterval`s.

## The mock backend

`src/api/mock/` simulates a room of 47 other people. When you submit, about 80% of them have already answered and the rest finish over 15 seconds. Grouping takes about a second, and the icebreaker unlocks when the room is complete. State persists in `localStorage`, so refreshes resume. Clear it from the kitchen sink, or with `localStorage.clear()`.

Questions come from a copy of `api/src/Catalog/Infrastructure/Content/questions.json`. Group profiles, meeting spots and the icebreaker are mock data in `src/api/mock/fixtures/groups.ts`.
