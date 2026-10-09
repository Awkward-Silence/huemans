# huemans: next steps

The plan for the 24h hackathon, from the architecture exploration. It covers what's decided, what's still open, and what each person does next.

## Decided

- **Core = color groups**, not 1:1 % matching. 1:1 matching, profile tags/infographics, after-event follow-up and "people you already know" are stretch goals.
- **Anonymous join** through the QR link, with no login.
- **TypeScript everywhere**: React (`web/`), NestJS (`api/`), Mastra inside the NestJS process.
- **Independent apps**: each has its own `package.json` and `node_modules`.
- **Contracts** in `contracts/`, as types only, consumed with `import type`.
- **Agents enrich, they never decide or block**: no LLM call in the quiz or grouping path, and every agent port has a fallback.

## Open decisions (resolve at kickoff)

| Decision | Options | Lean |
| --- | --- | --- |
| Is AI a judging criterion? | yes: agents become a lane from H6 / no: agents are stretch after H10 | Ask the organizers |
| Persistence | in-memory / Postgres (managed free tier) | Postgres, so a redeploy during the demo doesn't lose groups |
| Grouping algorithm | answer similarity + size cap per color / smarter clustering | Simple first, improve after H10 |
| Hosting | any platform that serves the React app + one Node process with WebSockets | Decide in H0-H2, deploy the skeleton early |

## Demo we build towards

```
judges scan QR on big screen -> 20s quiz on their phone
  -> "You are RED" (full screen, LED mode)
  -> big screen fills live with 4 colors + fun stats
  -> host taps "gather" -> "REDS -> left corner, ask each other: <question>"
```

If this works live with about 20 phones, the demo works. Everything else is a bonus.

## Timeline

```
         H0  H2      H6      H10     H14     H18   H20     H24
 Arch.   |ctr| Grouping v1 |integr.| Grouping+ |bots | rehearse
 Backend |ctr| question bank + submit | deadline | polish|  "
 Fullstk |ctr|RT spike| host screen | gather btn | polish|  "
 Front   |ctr| join + quiz UI | reveal + LED | gather | polish| "
                         ^               ^
                   walking skeleton   feature freeze
                   on a deployed URL  for stretch goals
```

- **H0-H2, contract kickoff (everyone):** agree on `contracts/` (REST DTOs, socket events, the `QuestionnaireCompleted` -> `AttendeeGrouped` seam), and resolve the open decisions above.
- **About H10, walking skeleton:** the demo path works end to end on a deployed URL, even if it's ugly.
- **H18, feature freeze:** no new features after this. Polish, bot seed script, rehearsal.

## Next steps per person

### Architect
1. Run `/ddd-bc` for **Grouping**, then `/ddd-model` (output goes to `docs/domain/grouping/`).
2. Write `contracts/` with the team at kickoff.
3. Create the OpenSpec changes with `/opsx:propose`, one per lane: `contracts`, `grouping`, `questionnaire`, `event-and-host`, `attendee-flow`, `agent-enrichments`.
4. Scaffold `api/` (NestJS) and `web/` (React/Vite) so the others can start.
5. Build Grouping v1 by H8, then integrate and deploy.

### Backend (Questionnaire)
1. Apply the `questionnaire` change: question bank, choose N questions per event, the 20s deadline rule, collect answers.
2. Emit `QuestionnaireCompleted` against a stub of Grouping. Don't wait for the real one.
3. Generate the question bank with a Mastra workflow (LLM generates, a human curates). About 50 good questions is enough.

### Fullstack (Event + host + realtime)
1. **Spike realtime first** (NestJS WebSocket gateway -> React) within H2-H4, before building any UI on top.
2. Apply `event-and-host`: create event + QR, big screen with live group counts, "gather" button.

### Frontend (Attendee)
1. Apply `attendee-flow` against mocked contract payloads: join, 20s quiz with timer, color reveal, LED full-screen mode, gather notification.
2. Make it work on a phone held above someone's head: big color, big text, nothing else.

### Everyone, H18-H24
- Bot seed script (about 40 fake attendees) so the big screen looks alive before the judges scan.
- Demo script, rehearse at least twice, and keep a fallback video in case the venue Wi-Fi fails.
