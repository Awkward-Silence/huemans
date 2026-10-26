# Proposal

## Why

The hackathon requires AI features, and the quiz is the moment every attendee is holding their phone. A last question where people build a silly sentence starting with "I ...", one AI-suggested word at a time, makes the AI visible and funny without letting it decide anything. It only works if it feels instant: a suggestion that takes two seconds kills the joke, so speed is the main requirement.

## What Changes

- Add a sentence-builder question as the **last quiz question**: the sentence starts with "I", and the attendee picks one of 3 options, 5 times. The quiz response announces it with its id, starter and number of picks.
- Add `GET /sentence-tree`: the whole "I ..." tree (3 options per pick, 243 sentences) in the shape of `tools/src/sentences/sentences.test.json`. **One call**, made by the attendee app at startup. There is no per-word suggestion call.
- Generate the tree in `api/` with one structured LLM call (OpenAI through Mastra, key in `OPENAI_API_KEY`), using a prompt kept in the source: funny, catchy and family-friendly. It is generated at boot and served from memory. Without a key or on failure, the endpoint answers 503.
- The attendee app retries the load, falls back to its bundled tree when the load failed, and waits at most 400 ms for a load still running before it cancels it and uses the bundled tree.
- The sentence is **fun only**. It carries no trait and does not affect the personality type or group. The finished sentence is kept on the phone and shown back to the attendee. Submitting the quiz never waits on the tree, and the attendee can skip the question.

## Capabilities

### New Capabilities
- `word-suggestions`: the "I ..." sentence-builder question, the word-suggestion endpoint, its speed and fallback guarantees, and how the attendee app uses it.

### Modified Capabilities

## Impact

- `api/`: a new `Agents` bounded context (the one `ai-enrichment` also plans) with a `SentenceTreeGenerator` port, a Mastra/OpenAI adapter and the prompt. New dependency: `@mastra/core`. New environment variables: `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_REASONING_EFFORT` and `SENTENCE_TREE_ON_BOOT`.
- Contracts: `api/contracts/sentenceTree.d.ts`.
- `web/`: `ApiClient.getSentenceTree`, the sentence tree loader, and the sentence-builder step reading from the tree.
- Depends on `quiz-and-answers` for the quiz response's `sentence` field. The web mock serves it meanwhile.
- Owners: TBD (backend: Diego or Adrián, web: Daniel).
