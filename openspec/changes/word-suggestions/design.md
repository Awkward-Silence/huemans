# Design

## Context

The motivation is in `proposal.md` and the requirements are in `specs/word-suggestions/spec.md`.

This design replaces an earlier one: a `POST .../word-suggestions` call for every pick, with an LRU cache, a rate limit and prefetching. Speed was its hardest problem. One generated tree, loaded once, removes the round trips altogether. `tools/src/sentences/` already models the tree (`SentenceTree.ts`, 3 options per pick, 5 picks), and `web/` already builds sentences from the bundled copy (`web/src/content/sentenceTree.json`).

## Goals / Non-Goals

**Goals:**
- No network wait between picks: the whole tree is on the phone before the step.
- The quiz never depends on the AI. With no key, a dead provider or no network, the bundled tree is used.
- The AI's content is fresh for each run of the API, in the app's tone.

**Non-Goals:**
- A tree per event or per attendee. There is one tree per API process.
- Persisting trees. A restart generates a new one.
- Moderation beyond the prompt and the domain's text rules.

## Decisions

**Agents bounded context.** `api/src/Agents/{Domain,Application,Infrastructure}`, the context `ai-enrichment` also plans, so both share one Mastra setup.
- Domain: `SentenceTree` (fixed starter "I", 5 picks), `SentenceOption`, `ValueObject/SentenceText`, `SentenceTreeDraft` (the generator's plain output), `SentenceTreeUnavailable`, and the port `Port/SentenceTreeGenerator`.
- Application: `ApplicationService.sentenceTree()`.
- Infrastructure: `Llm/MastraSentenceTreeGenerator`, `Llm/sentenceTreePrompt.ts`, `Http/SentenceTreeController`, `Lifecycle/GrowSentenceTreeOnBoot`, `AgentsModule`.
- There are no ORM entities and no migration.

**One structured call for the whole tree.**
- Mastra `Agent` on OpenAI: model `OPENAI_MODEL` (default `gpt-5-mini`; `gpt-4.1-mini` and `gpt-4.1` ignore the 3-option shape of the recursive schema) with `OPENAI_REASONING_EFFORT` (default `low`), up to 16k output tokens, a 180 s deadline. No temperature: reasoning models don't take one.
- Structured output with a recursive zod schema `{ text, trait, next }`. Mastra turns it into `$ref` definitions, which OpenAI strict mode supports. Spelling out the 5 levels would need 11 nesting levels, and strict mode allows 10.
- Mastra turns array bounds into hints, so the counts are not enforced by the schema. The prompt asks for 3 options per pick, and the domain checks.
- The model returns no ids. The domain derives them from each option's path, so they always match the tree. A round trip of `sentences.test.json` with its ids removed gives back the same file.

**The domain prunes, it does not repair.** `SentenceTree.grow(draft)` keeps the first 3 usable options of each pick. An option is unusable when its text or trait is invalid, its text repeats a sibling's, or its own next picks can't be grown. It throws `InvalidArgumentError` when a pick has fewer than 3 usable options. One bad branch then costs only that branch.

**Generated once per process.**
- The application service memoizes the generation promise, so concurrent requests await the same call.
- Up to 2 attempts per generation. `SentenceTreeUnavailable` (no key) is not retried.
- A failure clears the memo, so a later request tries again.
- `GrowSentenceTreeOnBoot` starts the generation at boot unless the key is missing or `SENTENCE_TREE_ON_BOOT=false`.

**HTTP.** `GET /sentence-tree` returns the tree (`contracts/sentenceTree.d.ts`), or `503` when it is unavailable. A request made while the generation is running waits for it. CORS (`CORS_ORIGIN`, already on main) lets `web/` call it from another origin.

**Prompt in the source.** `sentenceTreePrompt.ts` holds the instructions:
- the app's vibe;
- an explicit not-offensive list, which also checks combinations, not only single words;
- the grammar of the 5 slots (adverb, verb phrase, determiner, adjective, noun agreeing with its determiner);
- option rules and trait use, with the 33 traits interpolated from `Trait.ts`;
- the shape.

**Web: one load at bootstrap, then a latched choice.** `web/src/api/sentenceTree.ts`:
- `createSentenceTreeLoader(fetchTree, fallback)` with `load()`, `current()` and `choose()`, plus the hook `useSentenceTree()`.
- `main.tsx` calls `load()`, which runs 1 attempt and 3 retries (1 s, 2 s, 4 s).
- `choose()` waits at most 400 ms for a load still running, then aborts the request (an `AbortController` shared with the retries) and uses the bundled tree. Its result is latched for the whole session.
- `ApiClient.suggestWords` is replaced by `getSentenceTree(signal)`. `SentenceTreeSchema` rejects incomplete trees, so a bad tree counts as a failed load.
- `SentenceStep` derives its words with `nextWords(tree, sentence)` and no longer prefetches.

## Risks / Trade-offs

- [Generation takes about a minute] → It starts at boot. The client waits at most 400 ms on the step and otherwise plays the bundled tree.
- [The model miscounts deep in the tree] → Branch-level pruning plus 1 retry. If that still fails, the API answers 503 and the client uses the bundled tree.
- [Something offensive slips through] → The prompt's explicit list and short options. The tree can be reviewed with `curl /sentence-tree | tools generate:sentences`.
- [One tree for the whole night] → Accepted: two attendees rarely pick the same 5 options (243 sentences).

## Migration Plan

- New environment variables in `api/.env.example`: `OPENAI_API_KEY` (from the GitHub secret where the API is deployed), `OPENAI_MODEL`, `OPENAI_REASONING_EFFORT` and `SENTENCE_TREE_ON_BOOT`. Without a key the API answers 503 and the web uses its bundled tree, so deploying without one is safe.
- Rollback: remove `AgentsModule` from `AppModule`. The web keeps working on its bundled tree.
