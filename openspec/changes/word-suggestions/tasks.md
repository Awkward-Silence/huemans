# Tasks

## 1. Shared kernel and setup

- [ ] 1.1 Add the `SentenceQuestion` constant (`id: "sentence-i"`, `starter: "I"`, `picks: 4`) in `api/src/Shared/Domain/`, note it in `docs/domain/shared-kernel/model.md`, and verify `pnpm lint && pnpm build` pass
- [ ] 1.2 Add Mastra and the OpenAI provider to `api/package.json`, and add `OPENAI_API_KEY`, `OPENAI_MODEL` (with a "non-reasoning model only" comment) and `WORD_SUGGESTER_PROMPT_PATH` to `.env.example` and `src/config.ts`; verify `pnpm install && pnpm build` succeed and the app still starts with no key set
- [ ] 1.3 Create the `api/src/Agents/{Domain,Application,Infrastructure}` skeleton with an empty `AgentsModule` imported in `AppModule`, and verify `pnpm start:dev` boots and `/health` still answers

## 2. Domain (unit tests first, no NestJS or ORM imports)

- [ ] 2.1 Implement `SentencePrefix` (must start with the starter, 0–3 picks so far, each word 1–20 letters, `'` or `-`) and verify unit tests cover the wrong starter, a complete sentence, an empty word and a word with spaces
- [ ] 2.2 Implement word validation (trim, single word, length, case-insensitive dedupe, not already in the sentence, blocklist) and verify unit tests reject each invalid case and keep valid words
- [ ] 2.3 Define the `WordSuggester` port (`candidates(prefix, count)`) and the `EventDirectory` port (`exists(eventId)`), and verify `pnpm lint` passes (no framework imports in `Domain/`)

## 3. Application service

- [ ] 3.1 Implement `ApplicationService.suggestNextWords` with the 1 s race against the AI suggester, fallback fill to exactly 3 valid words and `source` (`"ai"` if any word came from the AI), and verify unit tests with fake suggesters cover a fast AI, a slow AI (> 1 s), an AI error, partially invalid output and no key configured
- [ ] 3.2 Add the in-memory LRU keyed by `promptHash | eventId | questionId | lowercased sentence`, random 3 out of the cached pool, in-flight dedupe, late AI results still filling the cache, and fallback results never cached; verify unit tests show one AI call for two concurrent identical requests, and that a late result is served from cache on the next request
- [ ] 3.3 Add the per-attendee rate limit (30 requests per minute, fixed window) that serves fallback words instead of failing, and verify a unit test where request 31 within a minute gets `source: "fallback"` and a fake clock resets the window

## 4. Infrastructure

- [ ] 4.1 Implement `StaticWordSuggester` with about 20 words per step (step 1 adverbs and verbs, step 2 verbs, step 3 determiners and adjectives, step 4 nouns), and verify a unit test that every list passes word validation and at least 3 words are always available
- [ ] 4.2 Write `api/prompts/word-suggester.md` (funny, family-friendly, single words that continue the sentence, 6 candidates, few-shot examples), and implement prompt loading with an mtime check and a content hash; verify a unit test that editing the file changes the hash without a restart
- [ ] 4.3 Implement `MastraWordSuggester` (Mastra agent on OpenAI, `OPENAI_MODEL`, structured `{ words: string[] }` output, max tokens about 40, 5 s hard abort), and verify an integration test (skipped when `OPENAI_API_KEY` is unset) returns at least 3 valid words for `["I"]`
- [ ] 4.4 Implement `EventDirectory` backed by the Event context's `ApplicationService.eventOf`, and verify a functional test that an unknown event returns `404`
- [ ] 4.5 Add `WordSuggestionsController` for `POST /events/:eventId/questions/:questionId/word-suggestions` with zod body validation (`attendeeId`, `sentence`) and `400`/`404` mapping, wire everything in `AgentsModule`, and verify functional tests cover `200` for steps 1 and 3, `404` for an unknown event or wrong question id, and `400` for a missing `attendeeId`, a wrong starter or a complete sentence, with the AI port faked
- [ ] 4.6 Subscribe to `EventCreated` to warm `["I"]` and its step-2 prefixes in the background, logging and ignoring failures, and verify a functional test that the first request after event creation is served from cache with the AI port faked
- [ ] 4.7 Measure p50 and p95 latency of a few candidate models with a throwaway script against the real key, set the fastest non-reasoning one as the `OPENAI_MODEL` default in `.env.example`, and record the numbers in the PR description

## 5. Attendee API contract

- [ ] 5.1 Document the new endpoint and the optional `sentence` field on `GET /events/:eventId/quiz` in `docs/api/attendee-api.md`, and verify the examples match the functional test payloads
- [ ] 5.2 Add the optional `sentence` field to the `quiz-and-answers` quiz response (or to the quiz endpoint, if it already exists, with a functional test asserting the field)

## 6. Web: API layer

- [ ] 6.1 Add `SentenceQuestionSchema` (optional `sentence` on `QuizSchema`), `WordSuggestionsRequestSchema` and `WordSuggestionsSchema` (exactly 3 words, `source`) to `web/src/api/schemas.ts`, and verify `npm run typecheck` passes
- [ ] 6.2 Add `suggestWords` to `ApiClient`, `httpClient.ts` and `mockClient.ts` (the mock returns `sentence` in the quiz and 3 random words from local lists after its latency), and verify `mockClient.test.ts` covers both
- [ ] 6.3 Add `wordSuggestionsQuery` to `queries.ts` (key includes the sentence, `staleTime: Infinity`, `retry: false`, a 1.5 s race resolving to client fallback words from `web/src/content/` on timeout or error), and verify a vitest that a rejected or slow request yields 3 fallback words

## 7. Web: sentence step

- [ ] 7.1 Extend the session with `sentence: string[]` and `sentenceSkipped: boolean`, and verify a vitest that an old session without these fields still parses
- [ ] 7.2 Build the sentence step (sentence so far, 3 word buttons, skip) shown after the last multiple-choice question when `quiz.sentence` is present, with copy in `web/src/content/`, and verify in `npm run dev` on `/join/demo` that 4 taps build the sentence and that a reload mid-sentence resumes
- [ ] 7.3 Prefetch the follow-up suggestions for the 3 shown words with `queryClient.prefetchQuery`, skipping the last pick, and verify a vitest (or the network panel in mock mode) that tapping a prefetched word shows the next words with no loading state
- [ ] 7.4 Change the quiz auto-submit to fire once the multiple-choice questions are answered and the sentence is complete or skipped, with the submit body unchanged, and verify `progress.test.ts`/`steps.test.ts` cover both "sentence done" and "skipped"
- [ ] 7.5 Show the finished sentence on `RevealScreen` and nothing when it was skipped, and verify both in `/join/demo`

## 8. End-to-end checks

- [ ] 8.1 With `VITE_API_MODE=http` against the local API and a real key, run the full attendee flow on a phone-sized viewport and verify the next words appear without a visible wait at steps 2–4
- [ ] 8.2 Repeat with `OPENAI_API_KEY` unset, and verify the flow completes with fallback words and the same group assignment behavior

## Workflow follow-up

- Run `/opsx:sync` and `/opsx:archive` once implemented and reviewed.
