# huemans: next steps

The plan for the 24h hackathon, based on the updated `initial-raw-specs.md` and the architecture exploration. It covers what's decided, what's still open, and what each person does next.

## Decided

- **Mobile first.** A desktop version isn't needed for the demo.
- **Core flow:** QR -> intro animation (2-3s) -> enter name -> 4-5 question quiz with a soft 20-30s timer -> suspense CTA -> color reveal + description -> live color distribution -> the night's ONE icebreaker -> LED badge mode (name + "ask me anything").
- **Soft timer.** Users may finish after time runs out. The backend accepts late answers and only records the duration.
- **4 colors assigned from traits.** Each answer maps to a trait, and traits map to colors through weights. Assignment is biased towards equal group sizes, happens once per attendee, and never changes after the reveal.
- **One icebreaker per night, chosen when the host closes the event (option A).** The host taps "reveal", the event goes from `OPEN` to `REVEALED`, and the icebreaker that best matches the room's trait profile is picked and broadcast to everyone.
- **Anonymous join** with a name only. The client keeps the attendee id so a reload resumes where it left off.
- **AI is required** by the hackathon. Agents enrich (personalized color explanation, icebreaker rationale) but never decide or block, and every agent call has a fallback.
- **Stack:** React (`web/`), NestJS + Mastra in-process (`api/`), type-only wire types in `api/contracts/`. Each app has its own `node_modules`.
- **Content already exists** in `api/src/Catalog/Infrastructure/Content/` (it lived in `tools/` until `catalog-aggregates`): 50 questions (4 trait-tagged answers each, 20 themes, 33 traits) and 51 icebreakers. Its JSON files are the catalog contract.
- **Nice to have, not core:** % match + per-person icebreaker, meeting at a spot in 2 minutes (with a sketched venue map), leveraging people who already know each other.

## Open decisions

| Decision | Options | Lean |
| --- | --- | --- |
| Trait-to-color weights | hand-written table / AI-proposed and reviewed / tuned by Jev | Four-color personality model (bold / social / warm / analytical) as the starting table |
| Capacity slack for balancing | strict quarter / quarter + 1-2 | Quarter + small slack, tune with bots |
| Persistence | in-memory / Postgres | Postgres, so a redeploy during the demo doesn't lose groups |
| Hosting | any platform that serves the React app + one Node process holding Server-Sent Events connections | Decide at kickoff, deploy the skeleton early |

## Demo we build towards (2-3 minutes, 10-15 people)

```
before the demo: bots + a few people pre-answer, so the room has a profile
judges scan QR -> intro -> name -> 4-5 funny questions (soft timer)
  -> "tap to reveal your color" -> "You are VIOLET" + why (AI)
  -> live distribution of the 4 colors fills up
  -> presenter taps "reveal" -> tonight's icebreaker on every phone
  -> phones go full-screen LED badge: name + "ask me anything"
```

## Backend OpenSpec changes

Each change has a proposal in `openspec/changes/<name>/`. Run `/opsx:propose <name>` to add specs, design and tasks, then `/opsx:apply <name>` to implement it.

```
create-event ----------------+--> web-live-distribution  (walking skeleton)
                             |
backend-skeleton-and-catalog +--> quiz-and-answers --> color-distribution (applied)
                                                              |
                             ai-enrichment <-- night-icebreaker <-+
```

| Change | Delivers | Owner | Rough hours |
| --- | --- | --- | --- |
| `backend-skeleton-and-catalog` | NestJS + Postgres + test suites, deployed. Seeds questions/icebreakers from the catalog content JSON, defines the 4 colors with trait weights | Adrián (skeleton), Diego (catalog) | H0-H5 |
| `create-event` | Event context: create event (`OPEN`, quiz settings), read it, publish `EventCreated` | Adrián | H4-H6 |
| `quiz-and-answers` | Participation context: quiz picked from the event id, join with name, submit answers (soft timer), publish `QuestionnaireCompleted` with traits | Diego | H4-H8 |
| `color-distribution` | Trait-to-color scoring, balanced final assignment, reveal endpoint, live counts + realtime push | Adrián | H3-H10 |
| `web-live-distribution` | `/room` read model and a UUIDv7 demo event, so `web/` runs against `api/` | Adrián | H6-H10 |
| `night-icebreaker` | Host closes the event, room-profile-based icebreaker pick, broadcast | Adrián | H10-H13 |
| `ai-enrichment` | Mastra in NestJS: personalized color explanation, icebreaker rationale, fallbacks | Diego + Adrián | H12-H18 |
| `word-suggestions` | The "I ..." sentence-builder question with AI-suggested words and fallbacks | TBD | — |

Frontend and host changes (`attendee-flow`, `event-and-host`) are still to be proposed by Daniel and Miguel.

## Timeline

```
         H0  H2      H6      H10     H14     H18   H20     H24
 Adrián  |ctr|skel|distrib+event+room|icebrk| AI |bots | rehearse
 Diego   |ctr|catalog| quiz+join+answers | AI   |polish|  "
 Miguel  |ctr|RT spike| host screen | reveal btn |polish|  "
 Daniel  |ctr| intro+name+quiz | reveal+distrib | icebrk+LED |  "
                         ^               ^
                   walking skeleton   feature freeze
                   on a deployed URL  (H18)
```

- **H0-H2, contract kickoff (everyone):** agree on the wire contracts, now in `api/contracts/` (REST DTOs, `QuestionnaireCompleted`, `AttendeeGrouped`, the icebreaker broadcast) and resolve the open decisions.
- **About H10, walking skeleton:** join -> answer -> color reveal works end to end on a deployed URL.
- **H18, feature freeze:** polish, bot seed script, rehearsal.

## Next steps per person

### Adrián (architect)
1. Done: color distribution modeled and applied, `api-skeleton` archived, Catalog modeled.
2. Propose and apply `create-event`, so `quiz-and-answers` and color distribution get real events.
3. Propose and apply `web-live-distribution` to close the walking skeleton.
4. Lead the contract kickoff and write the contracts (now `api/contracts/`), then `night-icebreaker`.

### Diego (backend)
1. Apply the catalog part of `backend-skeleton-and-catalog`: seed from the catalog content JSON and the colors with trait weights.
2. Propose and apply `quiz-and-answers`. Use a stub event lookup until `create-event` lands; color distribution already consumes `QuestionnaireCompleted`.
3. From H12, `ai-enrichment` with Adrián.

### Miguel (fullstack)
1. **Spike realtime first** (NestJS `@Sse()` endpoint -> React `EventSource`; SSE, not WebSockets) in H2-H4.
2. Propose and apply `event-and-host`: create event + QR, live distribution on the big screen, "reveal icebreaker" button.

### Daniel (frontend)
1. Propose and apply `attendee-flow` against mocked contract payloads: intro animation, name, quiz with progress bar and soft timer, suspense CTA, reveal, distribution, icebreaker, LED badge.
2. Mobile first: big text, thumb-friendly, readable from a distance in LED mode.

### Everyone, H18-H24
- Bot seed script (about 40 pre-answered attendees) so the room profile and distribution look alive.
- Demo script, rehearse at least twice, and keep a fallback video in case the venue Wi-Fi fails.
