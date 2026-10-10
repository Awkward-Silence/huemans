# Attendee API — what `web/` expects from `api/`

The REST contract the attendee app (`web/`, route `/join/:eventId`) already codes against, extracted from its in-browser mock. `api/` must serve these endpoints with these shapes for `VITE_API_MODE=http` to work without changes on the web side.

Sources (web side, the source of truth until `contracts/` exists):

- `web/src/api/client.ts`: the `ApiClient` interface (7 operations)
- `web/src/api/httpClient.ts`: HTTP method and path for each operation
- `web/src/api/schemas.ts`: zod schemas; every response is validated against them
- `web/src/api/mock/mockClient.ts`: mock behaviour (states, timing, 404s)
- `web/src/api/queries.ts`: which endpoints are polled and when polling stops

The host screen (`/host/:eventId`) does not exist in `web/` yet, so no host endpoints are listed here. See [Missing from the web contract](#missing-from-the-web-contract).

## Conventions

| Topic | Rule |
|---|---|
| Base URL | `VITE_API_URL`, default `http://localhost:3000`. No `/api` prefix and no version prefix. |
| Format | JSON in and out. Requests with a body send `Content-Type: application/json`. |
| Ids | `eventId` and `attendeeId` are opaque non-empty strings to the web (`z.string().min(1)`), URL-encoded in paths. The backend uses UUIDv7 (see [Gaps](#gaps-between-the-web-contract-and-the-backend-plan)). |
| Auth | None. Join is anonymous; the client keeps `attendeeId` (in local storage) and sends it in the path. |
| Extra fields | Allowed. Zod strips unknown keys, so the backend may add fields without breaking the web. Missing or mistyped fields fail. |
| CORS | The web runs on the Vite origin and calls `api/` cross-origin, so `api/` must enable CORS for it. |
| Live data | Polled for now (`VITE_LIVE_POLL_MS`, default 2000 ms). A realtime gateway may later push the same shapes into the cache. |

### Errors

The web maps every failure to one `ApiError` with a `kind`:

| Response | `kind` | Web behaviour |
|---|---|---|
| Fetch throws (offline, DNS, CORS) | `network` | Retried by React Query |
| `404` (any body) | `not-found` | **Not retried**; shows the not-found screen |
| Any other non-2xx | `http` (with `status`) | Retried |
| 2xx whose body fails the schema | `invalid-response` | **Not retried**; treated as a bug |

The web does not read error bodies, so their shape is free. Because a 404 is final, **never use 404 for a "not ready yet" state**: return `200` with a `status` field instead (see the assignment and icebreaker endpoints).

### Shared types

```ts
type Id = string;                                      // non-empty
type GroupColor = "amber" | "coral" | "teal" | "violet"; // web/src/domain/groupColor.ts
```

## Endpoints

| # | Operation | Method and path | Polled |
|---|---|---|---|
| 1 | `getEvent` | `GET /events/:eventId` | No (cached forever) |
| 2 | `join` | `POST /events/:eventId/attendees` | — |
| 3 | `getQuiz` | `GET /events/:eventId/quiz` | No (cached forever) |
| 4 | `submitAnswers` | `POST /events/:eventId/attendees/:attendeeId/answers` | — |
| 5 | `getAssignment` | `GET /events/:eventId/attendees/:attendeeId/assignment` | Every 1 s until `assigned` |
| 6 | `getRoom` | `GET /events/:eventId/room` | Every 2 s while on screen |
| 7 | `getIcebreaker` | `GET /events/:eventId/attendees/:attendeeId/icebreaker` | Every 2 s until `ready` |

---

### 1. Get event

`GET /events/:eventId`

Loaded first, on the intro screen. Gives the event name and the quiz size and duration shown before the quiz.

**Response `200`**

```ts
{
  id: Id;
  name: string;                 // "Demo night"
  quizDurationSeconds: number;  // int > 0; soft timer for the whole quiz
  questionCount: number;        // int > 0
}
```

```json
{ "id": "0199c5a2-…", "name": "Demo night", "quizDurationSeconds": 20, "questionCount": 5 }
```

**Errors:** `404` if the event does not exist.

---

### 2. Join event

`POST /events/:eventId/attendees`

Creates an anonymous attendee from a name. The web stores the returned id so a reload resumes the flow.

**Request**

```ts
{ name: string }
```

**Response `201` or `200`**

```ts
{ attendeeId: Id }
```

**Behaviour**

- Every call creates a new attendee (no dedupe by name).
- Joining stays open after answers start and after the icebreaker reveal.

**Errors:** `404` unknown event. Name validation (empty, too long) is up to the backend; any non-404 4xx surfaces as a generic error.

---

### 3. Get quiz

`GET /events/:eventId/quiz`

The questions for this event. Every phone in the event must get **the same questions in the same order** (the mock picks them with a seed from `eventId`).

**Response `200`**

```ts
{
  questions: Array<{          // at least 1; length should equal Event.questionCount
    id: Id;                   // catalog id, e.g. "q0001"
    theme: string;            // e.g. "home", "money", "hypothetical"
    text: string;             // non-empty
    answers: Array<{          // exactly 4
      id: Id;                 // e.g. "q0001-a"
      text: string;           // non-empty
    }>;
  }>;
  durationSeconds: number;    // int > 0; same value as Event.quizDurationSeconds
}
```

```json
{
  "questions": [
    {
      "id": "q0001",
      "theme": "home",
      "text": "Your houseplant is dying. What do you do?",
      "answers": [
        { "id": "q0001-a", "text": "Hold a small but dignified funeral" },
        { "id": "q0001-b", "text": "Spend three hours researching plant CPR" },
        { "id": "q0001-c", "text": "Quietly replace it before anyone notices" },
        { "id": "q0001-d", "text": "Tell it you believe in it" }
      ]
    }
  ],
  "durationSeconds": 20
}
```

**Behaviour**

- Do **not** send each answer's `trait`. The web ignores it, and it would give the grouping away. Traits are resolved server-side from `answerId`.
- Content comes from the catalog (`tools/` questions JSON, seeded into `api/`).

**Errors:** `404` unknown event.

---

### 4. Submit answers

`POST /events/:eventId/attendees/:attendeeId/answers`

Sends all answers at once when the quiz ends (all answered or timer done).

**Request**

```ts
{
  answers: Array<{ questionId: Id; answerId: Id }>; // may be shorter than the quiz (skipped questions)
  elapsedMs: number;                                 // int >= 0; time from quiz start to submit
}
```

```json
{
  "answers": [{ "questionId": "q0001", "answerId": "q0001-c" }],
  "elapsedMs": 17342
}
```

**Response:** any `2xx`; the body is ignored (`204 No Content` is fine).

**Behaviour**

- The timer is soft: **late submissions are accepted**, whatever `elapsedMs` is.
- The server maps each `answerId` to its trait, builds the trait profile and triggers grouping (`QuestionnaireCompleted` → `AttendeeGrouped`). Pairs with an unknown question or answer id are ignored, as in the mock.
- After success the web refetches the attendee's assignment and icebreaker.
- A second submit by the same attendee must not change the assignment (assignments are final). Accept it as a no-op or answer `409`; the web never sends it on purpose.

**Errors:** `404` unknown event or attendee.

---

### 5. Get assignment

`GET /events/:eventId/attendees/:attendeeId/assignment`

The attendee's group, shown on the reveal and badge screens. Polled every `livePollMs / 2` (1 s) until `status` is `assigned`.

**Response `200`**, a union on `status`:

```ts
| { status: "pending" }        // not submitted yet, or grouping still running
| {
    status: "assigned";
    color: GroupColor;
    nickname: string;          // group/personality title, e.g. "The Manual Readers"
    blurb: string;             // one-paragraph description
    traits: string[];          // traits shown as chips, e.g. ["analytical","curious","organized"]
    mates: number;             // int >= 0; OTHER people in the same group (members - 1)
    reason: {
      lean: Array<{            // how the answers leaned, strongest first (mock: top 2)
        color: GroupColor;
        percent: number;       // 0..100
      }>;
      text: string;            // one sentence explaining the placement
    };
  }
```

```json
{
  "status": "assigned",
  "color": "teal",
  "nickname": "The Manual Readers",
  "blurb": "You read the instructions. Twice. Then you explain them better than the instructions did.",
  "traits": ["analytical", "curious", "organized"],
  "mates": 11,
  "reason": {
    "lean": [{ "color": "teal", "percent": 67 }, { "color": "violet", "percent": 33 }],
    "text": "Most of your answers pointed here, and there was room for you."
  }
}
```

**Behaviour**

- Not yet assigned → `200 { "status": "pending" }`, **not 404**.
- `mates` is live: it grows as others join the group.
- `nickname`, `blurb` and `reason.text` are good places for the `ColorExplainer` agent, with static fallbacks. The endpoint must never wait on an LLM.

**Errors:** `404` unknown event or attendee.

---

### 6. Get room

`GET /events/:eventId/room`

Live progress and color distribution for the "waiting for the room" screen. Polled every 2 s while on screen.

**Response `200`**

```ts
{
  answered: number;            // int >= 0; attendees who submitted
  total: number;               // int >= 0; attendees who joined
  groups: Array<{              // the four colors, in GROUP_COLORS order, zeros included
    color: GroupColor;
    count: number;             // int >= 0; members assigned to this color
  }>;
}
```

```json
{
  "answered": 39,
  "total": 48,
  "groups": [
    { "color": "amber", "count": 8 },
    { "color": "coral", "count": 11 },
    { "color": "teal", "count": 10 },
    { "color": "violet", "count": 10 }
  ]
}
```

**Errors:** `404` unknown event.

---

### 7. Get icebreaker

`GET /events/:eventId/attendees/:attendeeId/icebreaker`

The night's one icebreaker and the gathering countdown. Polled every 2 s until `status` is `ready`.

**Response `200`**, a union on `status`:

```ts
| { status: "locked" }          // host has not revealed it yet
| {
    status: "ready";
    question: string;           // non-empty; the same for everyone in the event
    why: string;                // why this one was picked (room stats), e.g. "31 of you …"
    meetingSpot: string;        // where this attendee's group gathers, e.g. "the beer corner"
    gatherEndsAt: string;       // ISO 8601 date-time (UTC, "Z"); end of the gathering countdown
  }
```

```json
{
  "status": "ready",
  "question": "What's the last thing you quietly replaced before anyone noticed?",
  "why": "31 of you met a dying houseplant with “quietly replace it before anyone notices.” It was the most-agreed answer in the room.",
  "meetingSpot": "the beer corner",
  "gatherEndsAt": "2026-10-10T21:04:00.000Z"
}
```

**Behaviour**

- `locked` until the event is `REVEALED` (host close). Also `locked` if the attendee has no group yet.
- Once `ready`, every value is fixed: `question` and `why` are stored on the event at reveal, and `gatherEndsAt` is computed once (mock: reveal time + 120 s), so every phone shows the same countdown.
- `why` is the `IcebreakerExplainer` slot, with a static fallback.
- `meetingSpot` depends on the attendee's color (that's why the endpoint is per attendee). Meeting spots are nice-to-have, so a fixed string per color is enough.
- Late joiners still get `ready` once they have a group.

**Errors:** `404` unknown event or attendee.

## Gaps between the web contract and the backend plan

The web contract was written before the domain model. These conflict with `docs/domain/color-distribution/model.md` and the open OpenSpec changes and need a decision before `api/` serves the web:

1. ~~**Color names.**~~ Resolved: both sides use `amber | coral | teal | violet` (also the tie order), defined with hex values in `api/src/Types/Color.ts`.
2. ~~**Assignment "not yet".**~~ Resolved: `api/` answers `200 {status:"pending"}` until the attendee is grouped, `200 {status:"assigned", eventId, attendeeId, color, personalityType}` after, and 404 only for an unknown event. The assigned fields the web also needs (`nickname`, `blurb`, `traits`, `mates`, `reason`) are gap 3.
3. ~~**Personality type is missing; `lean` contradicts the model.**~~ Resolved in `api/` only, without changing `web/`: the assigned response adds `personalityType`; `nickname`, `blurb` and `traits` describe the personality type (static copy in `api/src/Types/PersonalityType.ts`), not the color; `mates` is the live group size minus one; `reason.lean` is always `[]` (answers decide the type, not the color) and `reason.text` explains the mixed placement. The web schema accepts this shape as is. If the web wants a type lean later ("60% explorer, 40% planner"), it needs a schema change on its side and the trait profile from Participation.
4. **Room vs distribution.** The web wants `GET /events/:eventId/room` (`answered`, `total`, per-color `count`). The backend plans `GET /events/:eventId/distribution` (per-color members and personality types, no `answered`/`total`). `total`/`answered` need Participation data, so `/room` is a read model that spans Participation and Color Distribution.
5. **Id format.** The backend validates UUIDv7 and answers `400` for anything else. The web dev entry point is `/join/demo`, so the demo event needs a UUIDv7 id (or a slug lookup) when running against `api/`.
6. **Event status.** `Event` has no `status` (`OPEN | REVEALED`). The web infers the reveal from the icebreaker endpoint. Adding `status` is harmless (extra fields are allowed) but nothing reads it yet.

## Missing from the web contract

Needed by the product flow but not in `ApiClient` yet. The backend should define these and add them to `contracts/`:

- **Create event** (host/demo setup), e.g. `POST /events` → `{ id, name, … }`.
- **Close event / reveal icebreaker** (host), e.g. `POST /events/:eventId/close`, `OPEN` → `REVEALED`, once only.
- **Host big-screen data**: the distribution and the revealed icebreaker without an `attendeeId`. `GET /events/:eventId/room` covers the distribution; an event-level icebreaker read is still needed.
- **Realtime**: the web is ready to swap polling for pushed `AttendeeGrouped` / icebreaker-revealed events carrying the same shapes as endpoints 5–7.
