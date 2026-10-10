# Proposal

## Why

The hackathon requires AI features, and the quiz is the moment every attendee is holding their phone. A last question where people build a silly sentence starting with "I ...", one AI-suggested word at a time, makes the AI visible and funny without letting it decide anything. It only works if it feels instant: a suggestion that takes two seconds kills the joke, so speed is the main requirement.

## What Changes

- Add a sentence-builder question as the **last quiz question**: the sentence starts with "I", and the attendee picks one of 3 suggested words, 4 times. The quiz response announces it with its id, starter and number of picks.
- Add `POST /events/:eventId/questions/:questionId/word-suggestions`: the client sends the sentence so far, and the API returns the next 3 words plus whether they came from the AI or the fallback.
- Generate the words in `api/` with an LLM (OpenAI through Mastra, key kept server-side). The "be funny" prompt lives in a file that can be edited without a code change.
- Make it fast: the client prefetches the follow-up words for all 3 shown words, the API caches suggestions by sentence prefix and warms the first step, and an AI call that takes over about 1 s is replaced by static fallback words.
- The API always answers with 3 words: on timeout, provider error, invalid model output or rate limit, it serves static fallback words. The client also has its own fallback, so the step never stalls.
- The sentence is **fun only**. It carries no trait and does not affect the personality type or group. The finished sentence is kept on the phone and shown back to the attendee. Submitting the quiz never waits on a suggestion, and the attendee can skip the question.

## Capabilities

### New Capabilities
- `word-suggestions`: the "I ..." sentence-builder question, the word-suggestion endpoint, its speed and fallback guarantees, and how the attendee app uses it.

### Modified Capabilities

## Impact

- `api/`: a new `Agents` bounded context (the one `ai-enrichment` also plans) with a `WordSuggester` port, an OpenAI adapter through Mastra, a static fallback, an in-memory cache and a per-attendee rate limit. New dependencies: Mastra and the OpenAI provider. New environment variables: the OpenAI API key, model and prompt file path.
- Attendee API: the new endpoint, plus an optional `sentence` field on the `GET /events/:eventId/quiz` response. Clients that ignore it keep working. Update `docs/api/attendee-api.md`.
- `web/`: schemas in `web/src/api/schemas.ts`, a new `ApiClient` operation with an HTTP and a mock implementation, and the sentence-builder step in the quiz.
- Depends on `create-event` for event lookup and `quiz-and-answers` for the quiz response. It can be built first, against the web mock and a stub event lookup.
- Owners: TBD (backend: Diego or Adrián, web: Daniel).
