# Prompt: build the attendee flow (web)

You are implementing the **attendee side** of huemans, a meetup app that sorts people into four colour groups and gets them talking. Read `CLAUDE.md` and `docs/next-steps.md` first. They take precedence over this prompt if anything conflicts.

The goal is a **maintainable React app that humans will keep changing** during a 24h hackathon and after it. Prefer clear structure, small files and obvious names over cleverness.

## Scope

Build screens 1–8 of the design's "two-minute demo flow" as the `/join/$eventId` part of a new `web/` app:

```
1 Intro -> 2 Name -> 3 Quiz -> 4 Suspense -> 5 Reveal -> 6 The room -> 7 Icebreaker -> 8 LED badge
```

Out of scope: the QR/tent card (it lives outside the app), the host screen, the real backend and realtime transport. Leave clean seams for all of them.

Design source (canvas): https://claude.ai/artifact/UdB73cbDMu68NpzUzWiaXC. The artboards are `project/Intro.dc.html` … `project/Led.dc.html`. If you can read them, treat them as the visual reference. The spec below has everything you need if you can't.

## Stack

- **npm** as package manager. `web/` has its own `package.json` and `node_modules` (no workspaces, see `CLAUDE.md`).
- **Vite + React + TypeScript** (strict mode).
- **TanStack Router** with file-based routes and the Vite plugin. Use typed params, `beforeLoad` for guards and `loader`s that prefetch through TanStack Query.
- **TanStack Query** for all server state. No server data in React state or context.
- **zod** for every boundary: API responses, form input, env/config and persisted session data. Infer TS types from schemas (`z.infer`). Don't hand-write duplicate types.
- **CSS Modules + CSS custom properties** for styling. No CSS-in-JS runtime and no utility framework.
- Fonts: **Bricolage Grotesque** (display) and **Space Grotesk** (body), self-hosted via `@fontsource-variable/*` / `@fontsource/*`. Venue Wi-Fi is unreliable, so don't load fonts from Google.
- Vitest + Testing Library, ESLint, Prettier.

Pick current stable versions. Don't add other libraries without a clear reason. Note any you add in the README.

## Architecture

```
web/src/
  app/            router setup, QueryClient, providers, root layout
  routes/         TanStack Router file routes, thin: read params, call hooks, render a screen
  features/
    join/         session (attendee id + name), name step
    quiz/         quiz screen, timer, answer flow
    grouping/     suspense, reveal, room
    gathering/    icebreaker, LED badge
  ui/             reusable presentational components, no data fetching
  theme/          tokens, theme definitions, CSS variable bridge
  content/        all user-facing copy
  api/            schemas, client interface, mock + http implementations, query keys/hooks
  lib/            small generic hooks/utils (countdown, wake lock, storage)
  config.ts       zod-validated app config
```

Rules:

- **Routes are thin.** A route file wires params and data to a screen component in `features/`. Screens compose `ui/` components and never contain raw colours, font sizes or copy.
- **`ui/` components are dumb and replaceable.** They take props, have no knowledge of routes or the API and own their own `*.module.css`. Each one should be swappable without touching the screens that use it.
- **One way to do each thing.** One button component (with variants), one screen layout, one heading scale, one countdown hook. If you are about to copy markup or styles a second time, extract it.
- **No hardcoded values in components:** colours, spacing, radii, font sizes, durations and easings come from theme tokens. Durations such as the quiz length and the gather countdown come from `config.ts`. Copy comes from `content/`.
- **Contracts:** if `contracts/` exists, check API schemas against it with `import type` and `satisfies` (never a runtime import, see `CLAUDE.md`). If it doesn't exist yet, put the schemas in `web/src/api/schemas.ts` and mark the types the team should move into `contracts/`.

## Theme (central and swappable)

- `theme/tokens.ts` defines a typed `Theme` shape (validate it with zod in dev). It has:
  - `color`: `bg`, `surface`, `text`, `textMuted`, `accent`, `accentHover`, `border`, `track` (empty progress), `onLight` (text on the light pill button)
  - `groups`: one entry per `GroupColorId` with `bg`, `ink`, `inkSoft`, plus a `textAccent` for use on the dark background (violet is too dark there)
  - `font`: `display` and `body` stacks
  - `type`: a named scale (`displayXL`, `displayL`, `title`, `lead`, `body`, `caption`, `eyebrow`) with size, line height, weight and letter spacing
  - `space`, `radius` (`sm`, `md`, `lg`, `pill`), `motion` (durations + easings)
- `theme/themes/default.ts` holds the design's values (below). Add one deliberately different second theme, for example `themes/light.ts`, to prove that switching works.
- `ThemeProvider` turns the active theme into CSS custom properties on `:root` (for example `--color-bg`, `--group-teal-bg`). Components only read `var(--…)`.
- The current attendee's group sets `--group-bg`, `--group-ink` and `--group-ink-soft` on its subtree, so group-coloured screens (reveal, icebreaker card, LED) use one set of vars whatever the colour.
- The theme can be picked with `?theme=` or config, for quick iteration.
- **Group identity is data, group colour is theme.** The API returns `color: 'amber' | 'coral' | 'teal' | 'violet'` and the group text (nickname, blurb, traits). The theme maps that id to the palette. Changing the palette must not touch API code.

Default theme values from the design:

| Token | Value |
| --- | --- |
| bg | `#121016` |
| surface | `#1D1A24` |
| text | `#F6F3EF` |
| textMuted | `#A6A0B0` |
| accent / accentHover | `#F5B13F` / `#FFD08A` |
| border | `rgba(255,255,255,0.14)` |
| track | `rgba(255,255,255,0.12)` |
| amber | bg `#F5B13F`, ink `#1A1410`, inkSoft `rgba(26,20,16,0.74)` |
| coral | bg `#EE5E7B`, ink `#2B0A12`, inkSoft `rgba(43,10,18,0.76)` |
| teal | bg `#0E8176`, ink `#FFFFFF`, inkSoft `rgba(255,255,255,0.86)` |
| violet | bg `#4A3DC9`, ink `#FFFFFF`, inkSoft `rgba(255,255,255,0.86)`, textAccent `#8A80E8` |

The type scale uses display font weight 700–800 with tight negative tracking (−0.02 to −0.045em), from 92px (reveal label) down to 34–40px (screen titles). Body text is Space Grotesk at 13–22px. Eyebrows are 12–14px uppercase with 0.14–0.2em tracking. Radii are 10 / 18 / 24px and pill. Primary CTAs are pills 60–68px tall.

## Data layer

- `api/client.ts` defines an `ApiClient` interface. It has two implementations, `mockClient` (in-memory, simulated latency, a simulated room filling up over time) and `httpClient` (fetch against `VITE_API_URL`, with stub endpoints). Select one with `VITE_API_MODE=mock|http` and validate the env with zod in `config.ts`.
- Every response goes through its zod schema before it reaches a component. A parse failure becomes a typed error that the UI can show.
- `api/queries.ts` holds a query-key factory plus `queryOptions` / hooks (`useEvent`, `useQuiz`, `useAssignment`, `useRoom`, `useIcebreaker`) and mutations (`useJoin`, `useSubmitAnswers`).
- "Live" data such as room counts and icebreaker unlock uses `refetchInterval` for now. Put it behind the hook so a WebSocket adapter can replace polling later without changing screens.
- Mock fixtures: reuse question text from `api/src/Catalog/Infrastructure/Content/questions.json` (copy it, don't import across apps). Questions have the shape `{ id, theme, text, answers[4]: { id, text } }`. The client doesn't need `trait`.

Suggested resources (adjust to `contracts/` if it exists):

- `POST /events/:eventId/attendees { name }` → `{ attendeeId }`
- `GET /events/:eventId/quiz` → `{ questions[], durationSeconds }`
- `POST /events/:eventId/attendees/:id/answers { answers: { questionId, answerId }[], elapsedMs }`
- `GET /events/:eventId/attendees/:id/assignment` → `{ color, nickname, blurb, traits[], mates, reason: { lean: { color, percent }[], text } }`
- `GET /events/:eventId/room` → `{ answered, total, groups: { color, count }[] }`
- `GET /events/:eventId/attendees/:id/icebreaker` → `{ status: 'locked' } | { status: 'ready', question, why, meetingSpot, gatherEndsAt }`

## Session and routing

- The attendee session (`attendeeId`, `name`, chosen answers) is persisted in `localStorage`, keyed by eventId and validated with zod on read. A refresh mid-flow resumes at the right step.
- Routes live under `/join/$eventId`: `/` (intro), `/name`, `/quiz`, `/sorted`, `/reveal`, `/room`, `/icebreaker`, `/badge`. Use `beforeLoad` guards so a step that needs a name or an assignment redirects back to the right step.
- Step order and progress come from a single ordered step definition, not from links scattered through screens.

## Screens

The layout is mobile-first and fluid: `100dvh`, safe-area insets, a max content width of about 480px centred on desktop. The design is drawn at 390×844. Every animation respects `prefers-reduced-motion`.

1. **Intro.** Four vertical colour "blades" (amber, coral, teal, violet; heights 62/86/44/72%) grow up from the bottom with staggered delays (0.12s apart, 2.4s, ease `cubic-bezier(.16,1,.3,1)`), under a dark gradient. The wordmark "huemans" (72px, weight 800) fades in from wide letter spacing. Then the lines "Four colours in this room. One of them is yours." and an eyebrow "{quizSeconds} seconds · starts now" rise in. It moves to Name on tap or after a short configurable delay.
2. **Name.** A 3-segment step indicator (segment 1 active). The label "What should people call you?" is a real `<label>` for the input. Helper text: "This goes on your badge later, big enough to read across a room. A first name or a nickname is plenty." The input is large display type with an accent underline, placeholder "Ana". Validate with zod (trimmed, 1–12 chars) and show the hint "12 characters max — it has to fit on a phone screen." The CTA pill reads "Start the {n} seconds" with an arrow icon and is disabled until the name is valid. Footer: "No sign-up, no email. Your answers are deleted when the event ends."
3. **Quiz (one question per screen).** A top time bar drains over `durationSeconds`. The header shows "2/5", a theme chip (accent-tinted pill) and a large seconds countdown. The question is a display heading. Four full-width answer buttons (min 76px) have an A–D key badge. Tapping an answer records it and advances. At the bottom, a segmented progress bar per question (answered, current, upcoming) and the note "When the bar empties nothing closes — you still get to finish. The {n} seconds are a nudge, not a gate." The deadline is a nudge only: the timer reaching 0 does not end the quiz. After the last answer, submit, then go to Suspense.
4. **Suspense.** Four blurred colour orbs breathe behind the text. Eyebrow "{answers} answers · {seconds} seconds". Heading "{name},<br>you're sorted." Line "One of four colours has your name on it. {mates} people in this room share it." A gently bobbing CTA "Reveal my colour" sits above the hint "Hold the phone up when it changes." Show a loading state until the assignment query resolves.
5. **Reveal (flood).** The group colour floods in as a circle `clip-path` from 50%/42% (0.9s). Content lifts in, staggered: eyebrow "Your colour", the label (for example "TEAL", 92px), the nickname, the blurb, trait pills, "{mates} others in this room are {color} too", and the CTA "See the room" (ink pill on the group colour).
6. **The room.** Heading "The room, right now". "{answered} of {total} answered · {total−answered} still typing" with a progress bar. Four bars grow from the bottom, one per group, with height proportional to count, the count above and the name below, and a "you" marker under the attendee's group. A bordered card titled "Why {yours} and not {runnerUp}" explains the assignment reason. The CTA "Tonight's icebreaker" is disabled with "Unlocks when the last person finishes." until the icebreaker status is `ready`.
7. **Icebreaker.** A pulsing dot in the group colour and the eyebrow "One question · everyone · tonight". A group-coloured card shows a quote icon and the question. "Why this one" explains it. A bordered card reads "{Color}, meet at {meetingSpot}" with a mm:ss countdown to `gatherEndsAt` and "{mates} others are heading there. Look for the {color} screens held up in the air." The CTA in the group colour is "Turn my phone into a badge", with the hint "Screen stays on. Hold it chest height."
8. **LED badge.** The full screen is the group colour. Top row: "{Color} · {nickname}" and an "Exit" button (aria-label "Leave badge mode", back to Icebreaker). The name is huge (108px, uppercase, auto-shrinks to fit), followed by a short rule and "ASK ME<br>ANYTHING". Below sit the icebreaker in quotes and a blinking hint "Turn sideways to scroll it". Request the **Screen Wake Lock** while this screen is mounted and release it on exit. Try fullscreen on enter (best effort). The sideways marquee is a stretch goal: implement it only if it stays simple.

All copy is British English ("colour") and lives in `content/`. Keep it parameterised (`t.quiz.nudge({ seconds })`), not string-concatenated in JSX.

## Reusable building blocks (expected, not exhaustive)

`Screen` (layout shell: padding, safe area, background variant `default | group`), `Stack`, `Heading` (by scale name), `Text` (by scale + tone), `Eyebrow`, `Button` / `ButtonLink` (variants `light | group | groupInk`, optional trailing icon, loading/disabled), `TextField`, `StepIndicator`, `TimeBar`, `SegmentedProgress`, `Countdown`, `AnswerOption`, `Chip` / `TraitPill`, `InfoCard`, `GroupBars`, `ColorBlades`, `ColorOrbs`, `FloodReveal`, `PulseDot`, `Icon` (inline stroke SVG set: arrow-right, quote, rotate-phone).

Hooks: `useCountdown(deadline | durationMs)`, `useWakeLock()`, `useAttendeeSession(eventId)`, `useGroupTheme(color)`.

## Quality bar

- Accessible as built: real `<button>`/`<a>`/`<label>`, visible focus, ≥44px targets, `aria-live` for the countdown at a polite rate (not every second), text contrast ≥4.5:1.
- Tests for the logic that can break: name validation, countdown, quiz progression and submit, session resume and route guards, schema parsing of mock responses, and the theme-to-CSS-variable mapping.
- `npm run dev | build | preview | lint | typecheck | test` all work. Add the commands, including how to run a single test, to `CLAUDE.md` under a `web/` section.
- `web/README.md` explains how to add a theme, a group colour, a screen/step and a copy string, and how to switch mock/http.
- Don't leave TODO code paths reachable in the demo flow. Where a value is a guess (for example the meeting spot), label it as mock data in the fixtures.

## Working order

1. Scaffold `web/` with the stack and tooling. Commit.
2. Theme + `ui/` primitives + a dev-only `/_kitchen-sink` route that renders every component in every variant. Commit.
3. API schemas, mock client, query hooks. Commit.
4. Screens 1–8 in order, each one working end to end against the mock before you start the next. Commit per screen or two.
5. Tests, README, `CLAUDE.md` commands.

Run typecheck, lint and tests before each commit. Report anything you had to decide that this prompt didn't cover.
