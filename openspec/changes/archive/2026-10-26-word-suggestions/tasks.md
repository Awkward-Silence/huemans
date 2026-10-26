# Tasks

## 1. Setup

- [x] 1.1 Add `@mastra/core` (1.68.0) to `api/package.json`, and `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` (`claude-sonnet-5-5`) and `SENTENCE_TREE_ON_BOOT` to `.env.example` and `src/config.ts`; verify `pnpm build` passes and the app starts with no key set
- [x] 1.2 Create `api/src/Agents/{Domain,Application,Infrastructure}` with `AgentsModule` imported in `AppModule`

## 2. Domain (unit tests first)

- [x] 2.1 `SentenceText` (trimmed, 1–30 characters, letters, inner spaces, `'` and `-`), and verify `SentenceText.test.ts`
- [x] 2.2 `SentenceTree.grow(draft)` / `SentenceOption` (first 3 usable options per pick, path ids, `InvalidArgumentError` when a pick has fewer than 3), and verify `SentenceTree.test.ts`
- [x] 2.3 The `SentenceTreeGenerator` port and `SentenceTreeUnavailable`; verify `pnpm lint` (no framework imports in `Domain/`)

## 3. Application and infrastructure

- [x] 3.1 `ApplicationService.sentenceTree()`: a memoized generation shared by concurrent callers, 2 attempts, failures not cached
- [x] 3.2 `sentenceTreePrompt.ts` (vibe, not-offensive list, the grammar of the 5 slots, traits, shape) and `MastraSentenceTreeGenerator` (structured output, one schema level per pick); verify a faked model response of `sentences.test.json` without ids round-trips to the same file
- [x] 3.3 `GET /sentence-tree` (200, or 503 when unavailable) and `GrowSentenceTreeOnBoot`; verify `tests/Functional/Agents/SentenceTree.test.ts` with the generator faked
- [x] 3.4 Integration test against the real model, run by `pnpm test:llm` and skipped without `ANTHROPIC_API_KEY`
- [x] 3.5 `api/contracts/sentenceTree.d.ts`
- [x] 3.6 Run the integration test with the real key and check one generated tree by eye (`curl localhost:3000/sentence-tree > t.json && npx tsx src/sentences/generate.ts t.json` in `tools/`); tune the prompt if needed

## 4. Attendee API contract

- [x] 4.1 Add the optional `sentence` field (`{ id: "sentence-i", starter: "I", picks: 5 }`) to the `quiz-and-answers` quiz response

## 6. Web: API layer

- [x] 6.1 `SentenceTreeSchema` (complete trees only) and `SentenceQuestionSchema` in `web/src/api/schemas.ts`; `ApiClient.getSentenceTree(signal)` in the HTTP and mock clients, replacing `suggestWords`
- [x] 6.2 `web/src/api/sentenceTree.ts`: load at bootstrap (`main.tsx`) with 3 retries; on the step, the loaded tree, the bundled tree after a failure, or a 400 ms wait then cancel and the bundled tree, latched; verify `sentenceTree.test.ts`

## 7. Web: sentence step

- [x] 7.1 Extend the session with `sentence: string[]` and `sentenceSkipped: boolean`, and verify a vitest that an old session without these fields still parses
- [x] 7.2 Build the sentence step (sentence so far, 3 word buttons, skip) shown after the last multiple-choice question when `quiz.sentence` is present, with copy in `web/src/content/`, and verify in `npm run dev` on `/join/demo` that 5 taps build the sentence and that a reload mid-sentence resumes
- [x] 7.3 Derive the step's words from the chosen tree with `nextWords` (no prefetching, no per-word request), pinned to the sentence so they never reshuffle, and verify `SentenceStep.test.tsx` covers the undecided, bundled and generated trees
- [x] 7.4 Change the quiz auto-submit to fire once the multiple-choice questions are answered and the sentence is complete or skipped, with the submit body unchanged, and verify `progress.test.ts`/`steps.test.ts` cover both "sentence done" and "skipped"
- [x] 7.5 Show the finished sentence on `RevealScreen` and nothing when it was skipped, and verify both in `/join/demo`

## 8. End-to-end checks

- [x] 8.1 With `VITE_API_MODE=http` against the local API and a real key, run the full attendee flow and verify the sentence step shows generated words with no visible wait
- [x] 8.2 Repeat with `ANTHROPIC_API_KEY` unset, and verify the flow completes on the bundled tree

## Workflow follow-up

- Run `/opsx:sync` and `/opsx:archive` once implemented and reviewed.
