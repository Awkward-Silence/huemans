# huemans

A web app to get to know people using colors.

You arrive at an event and don't know anyone. Scan a QR code, answer a few silly questions in 20 seconds, and huemans drops you into a **color group** of like-minded people. Raise your phone to show your color, and when the host calls it, meet your group with a ready-made icebreaker question.

Built in a 24h hackathon.

## How it works

1. The host screen shows a QR code for the event.
2. Attendees scan it and answer a 20-second multiple-choice quiz. No sign-up needed.
3. Everyone is assigned to a color group based on their answers.
4. Phones go full-screen in their color (LED mode) so groups can find each other.
5. The host triggers a gathering: "All REDS to the bar corner in 5 minutes", and each group gets an icebreaker question.
6. AI agents add the fun on top: group names, tailored icebreakers and live stats on the big screen.

## Stack

| Part | Tech |
| --- | --- |
| `web/` | React (attendee app + host big screen) |
| `api/` | NestJS, with Mastra agents running in-process |
| `contracts/` | Shared TypeScript types (type-only imports, no dependencies) |

Each app installs its own dependencies.

## Running it locally

You need Node 24 (see `.nvmrc`), [pnpm](https://pnpm.io) for `api/`, npm for `web/`, and Docker for the database.

### Frontend only (mock backend)

The web app ships with an in-browser mock of the API, so you can run the whole attendee flow without `api/`:

```bash
cd web
npm install
npm run dev          # http://localhost:5173
```

Open `/join/demo` for the attendee flow (any event id works) or `/event` to create an event and show its QR code.

### Frontend with the real API

**1. Database and API** (in `api/`):

```bash
pnpm install
cp .env.example .env               # first time only
docker compose up -d               # Postgres 17 on localhost:5432
pnpm migration:up                  # create the tables
pnpm catalog:seed                  # load questions and icebreakers, once per database
pnpm seed:demo                     # optional: the demo event 0199c0de-0000-7000-8000-000000000001
pnpm start:dev                     # http://localhost:3000, restarts on changes
```

`curl localhost:3000/health` tells you it is up. After the first time, `docker compose up -d` and `pnpm start:dev` are enough. `JEV_API_KEY` in `.env` is optional: without it the AI step is skipped.

**2. Web app** (in `web/`):

```bash
cp .env.example .env               # then set VITE_API_MODE=http
npm run dev
```

Vite reads `.env` only at startup, so restart `npm run dev` after changing it. To open the seeded demo event from the home page, also set `VITE_DEMO_EVENT_ID=0199c0de-0000-7000-8000-000000000001`. The API only accepts UUIDv7 ids, so `/join/demo` works in mock mode only.

### Tests

```bash
cd api && pnpm test                # needs Postgres up and the test database set up, see CLAUDE.md
cd web && npm test
```

More commands: [`web/README.md`](web/README.md) and [`CLAUDE.md`](CLAUDE.md).

## Team

| Name | Role | Owns |
| --- | --- | --- |
| Adrián | Architect | Contracts, Grouping (core domain), integration and deploy |
| Diego | Backend | Questionnaire: question bank, 20s deadline, answers |
| Miguel | Fullstack | Event + QR, host big screen, realtime gathering |
| Daniel | Frontend | Attendee mobile flow: join, quiz, color reveal, LED mode |

## Docs

- [Next steps / hackathon plan](docs/next-steps.md)
- [Raw product ideas](initial-raw-specs.md)
- Specs and changes live in [`openspec/`](openspec/)
