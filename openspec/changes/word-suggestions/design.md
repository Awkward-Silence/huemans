# Design

## Context

The motivation is in `proposal.md` and the requirements are in `specs/word-suggestions/spec.md`. Current state:

- `api/` is a single NestJS app. `ColorDistribution` is the only bounded context so far. The shared kernel already has `EventId`, `AttendeeId`, `EventCreated` and an in-process `InMemoryEventDispatcher`. There is no `Agents` context, no Mastra and no Event context yet. The quiz endpoint belongs to `event-join-and-answers`, which is still only a proposal.
- `web/` already has the full attendee flow against an in-browser mock. The API layer is `ApiClient` (`web/src/api/client.ts`), with HTTP and mock implementations and zod schemas in `web/src/api/schemas.ts`. React Query lives in `web/src/api/queries.ts`, and the per-event session lives in localStorage (`web/src/features/join/session.ts`). `QuizScreen` auto-submits once every question is answered.
- The deployment is one API process, serving a demo of 10–15 phones, sometimes on venue wifi.

## Goals / Non-Goals

**Goals:**
- From the attendee's point of view, the next words show up instantly, usually with no network wait.
- The quiz never depends on the AI. With no key, a dead provider or no network, the flow still completes.
- The prompt can be tuned while the API is running.

**Non-Goals:**
- Storing sentences server-side, or showing them on the host screen. The sentence stays on the phone.
- A trait or any grouping effect from the sentence.
- Running more than one API instance. The cache and rate limit are per process.
- Content moderation beyond the prompt plus a small blocklist.

## Decisions

**Agents bounded context.** Create `api/src/Agents/{Domain,Application,Infrastructure}`, the context `ai-enrichment` also plans, so both share one Mastra setup.
- Domain: `SentencePrefix` value object (starter, at most 3 picks so far, word validation), `SuggestedWord`, and ports `Domain/Port/WordSuggester` and `Domain/Port/EventDirectory`.
- Application: `ApplicationService.suggestNextWords(eventId, questionId, attendeeId, sentence)`.
- Infrastructure: `Http/WordSuggestionsController`, `Llm/MastraWordSuggester`, `Fallback/StaticWordSuggester`, `AgentsModule`.

There are no ORM entities and no migration.

**Sentence question as a shared-kernel constant.** `SentenceQuestion { id: "sentence-i", starter: "I", picks: 4 }` lives in `api/src/Shared/Domain/`, so the quiz endpoint (Event context) and `Agents` agree on it without importing each other. Every event has the same sentence question. Alternative: per-event sentence questions picked from the catalog. Rejected because there is no content for it and it adds nothing to the demo.

**Event existence through a port.** `EventDirectory.exists(eventId)` returns the 404. Until the Event context exists, a provisional adapter accepts any well-formed `EventId`, the same pattern as `ProvisionalTraitTypeMappingProvider`. The real adapter is swapped in when `event-join-and-answers` lands. `attendeeId` is used only as the rate-limit key and is not checked against Participation. A fake id gains nothing but fallback words.

**Mastra agent with structured output.**
- `MastraWordSuggester` runs a Mastra `Agent` on the OpenAI provider, with the model taken from `OPENAI_MODEL`.
- The output schema is `{ words: string[] }`, with `maxTokens` around 40 and a high temperature. It asks for **6 candidates** per call, not 3.
- The model must be a small, **non-reasoning** model. Reasoning models add seconds before the first token.

Alternative: the plain OpenAI SDK or `generateObject` without Mastra. That is slightly leaner, but CLAUDE.md puts agents behind ports in Mastra, and `ai-enrichment` needs Mastra anyway. If Mastra measurably adds latency, the adapter can drop to `generateObject` behind the same port without changing anything else.

**A cached pool of candidates, served 3 at random.** The application service keys an in-memory LRU (about 5,000 entries, no TTL) by `promptHash | eventId | questionId | lowercased sentence`. The cached value is the validated candidate pool. Each response takes 3 random words from the pool, minus any word already in the sentence. People at the same step therefore get varied words, and the AI is called once per prefix, not once per request.
- If fewer than 3 valid candidates remain, the static fallback fills the gap. `source` is `"ai"` when at least one word came from the AI.
- Requests for a prefix that is already in flight await the same promise, so two phones prefetching the same prefix trigger one call.

Alternative: one AI call per request. That gives the most variety, but every step costs a full round trip, and identical prefetches multiply the cost.

**Timeout without wasting the call.**
- The service races the AI call against a **1 s** timer. If the timer wins, the response uses fallback words.
- The AI call keeps running up to a hard 5 s abort, and its result still fills the cache, so the next request for that prefix gets AI words.
- Fallback results are never cached.

**Warm the top of the tree.** On `EventCreated`, a subscriber asks for `["I"]` in the background, then for each `["I", w]` of its candidates (up to 7 calls per event). This also opens the TLS connection to the provider before the demo. Warming failures are logged and ignored.

**Prompt file, hot-reloaded.**
- `WORD_SUGGESTER_PROMPT_PATH` (default `api/prompts/word-suggester.md`) holds the system prompt: be funny and family-friendly, give single words that continue the sentence grammatically, and return 6 of them. It includes a few examples.
- The adapter `stat`s the file on each call and re-reads it when its mtime changes. The prompt's hash is part of the cache key, so an edit stops old entries from being served.
- The request message carries only the sentence so far.

**Output validation in the domain.** Each candidate is trimmed. A candidate is rejected if it has spaces, has characters other than letters, `'` or `-`, is longer than 20 characters, is a case-insensitive duplicate, is already in the sentence, or is on a small blocklist. This runs on both AI and fallback words.

**Static fallback.** `StaticWordSuggester` keeps one list of about 20 words per step. Step 1 is mostly adverbs and verbs ("secretly", "once", "never"), step 2 verbs, step 3 determiners and adjectives, step 4 nouns. It picks at random. After AI picks, the result is not always grammatical, which is acceptable and often funnier.

**Rate limit returns fallback words, not 429.** A fixed one-minute window per `attendeeId` allows 30 requests. One full sentence with prefetching costs 10: 1 for step 1, then 3 prefetches at each of steps 1–3. The web treats every error as "show fallback", so a 429 would only add a code path. Answering `200` with fallback words keeps the spec's "never fails because of the AI" rule simple.

**HTTP.** The body is validated with zod in the controller, and domain `InvalidArgumentError` maps to `400`, the same as in existing controllers. The response is `{ words: string[3], source: "ai" | "fallback" }`.

**Web: prefetch through React Query.**
- `ApiClient.suggestWords(eventId, questionId, { attendeeId, sentence })` goes into `client.ts`, `httpClient.ts` and `mockClient.ts`. The mock picks from local word lists after its usual latency.
- `wordSuggestionsQuery` keys on the sentence, with `staleTime: Infinity` and `retry: false`. Words never reshuffle on screen.
- While 3 words are shown, the step calls `queryClient.prefetchQuery` for each of the 3 extended prefixes. It skips prefetching at the last pick.
- The query function races the request against **1.5 s** and resolves to client fallback words from `web/src/content/` on timeout or error.

**Web: quiz flow and session.**
- `QuizScreen` shows the sentence step after the last multiple-choice question when `quiz.sentence` is present.
- The session gains `sentence: string[]` (the picks) and `sentenceSkipped: boolean`, so a reload resumes mid-sentence.
- Auto-submit fires once the multiple-choice questions are answered **and** the sentence is complete or skipped. The submit body is unchanged.
- `RevealScreen` reads `session.sentence` and renders it when it is complete.

## Risks / Trade-offs

- [Provider latency spikes or outage on stage] → 1 s server timeout, the 1.5 s client timeout, warmed cache and fallbacks at both ends. Rehearse once with the key removed.
- [Someone sets a reasoning model in `OPENAI_MODEL`] → Document "non-reasoning only" in `.env.example`, and measure p50 latency at setup (see tasks).
- [The model suggests something offensive in front of the room] → Family-friendly prompt plus a blocklist in validation. Each word stays harmless on its own.
- [Users can't send arbitrary text into the prompt] → Words are validated as single, short tokens and the starter is fixed, so prompt injection has no surface worth defending further.
- [Fallback sentences can be ungrammatical] → Accepted: they are still funny, and `source` lets us see how often it happens.
- [The cache and rate limit live in one process] → Fine for one instance. Moving to more instances would need a shared store, which is out of scope.
- [The quiz field and event lookup depend on `event-join-and-answers`] → Provisional `EventDirectory`, an optional `sentence` field, and the web mock let both sides ship first.

## Migration Plan

- No database changes. New environment variables (`OPENAI_API_KEY`, `OPENAI_MODEL`, `WORD_SUGGESTER_PROMPT_PATH`) go into `.env.example`. Without a key the endpoint serves fallback words, so deploying without one is safe.
- Rollback: stop sending `quiz.sentence`, and the web skips the step. The endpoint can stay.

## Open Questions

- Which OpenAI model to use: pick the fastest non-reasoning mini/nano model by measured p50 latency at setup time. This is configuration only.
- The final content of the fallback word lists and the prompt's few-shot examples. This is copywriting and can be tuned until demo time.
