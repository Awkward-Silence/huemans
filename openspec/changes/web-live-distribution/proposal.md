# Proposal

## Why

The walking skeleton is done when a phone runs join -> answer -> reveal against the real `api/` (`VITE_API_MODE=http`) instead of the in-browser mock. `docs/api/attendee-api.md` listed the gaps between the web contract and the backend. Gaps 1-3 (color names, `pending` instead of `404`, personality type instead of `lean`) are already resolved on the API side. Two gaps still block the web: the room screen and the demo event id.

## What Changes

- Serve `GET /events/:eventId/room` with the shape the web polls: `{ answered, total, groups: [{ color, count }] }`, with all four colors in tie order and zeros included. This is a read model across two contexts: `total` and `answered` come from Participation, the per-color counts from Color Distribution. Unknown event → `404`.
- Make the demo event reachable with a valid UUIDv7. The web dev entry point is `/join/demo`, and the API rejects non-UUIDv7 ids. Add a seed command that creates a demo event with a fixed UUIDv7 through `create-event`, and point the web's demo link and QR at it when running against the API.
- Run the web with `VITE_API_MODE=http` against the seeded demo event as far as the API allows (event intro and room), and update `docs/api/attendee-api.md` to mark gaps 4 and 5 as resolved. Join, quiz and answers need Participation, so the full attendee flow end to end waits for `quiz-and-answers`.
- `Color` moves to the shared kernel (`SK::Color`, `docs/domain/room/model.md`), because Room and Night Icebreaker use it too.
- Out of scope: the icebreaker endpoint (`night-icebreaker`), realtime push (polling stays), and the host big screen (`event-and-host`).

## Capabilities

### New Capabilities
- `room`: the live room read model (joined, answered, members per color) that attendee and host screens poll.
- `demo-event`: a seed command for a demo event with a fixed UUIDv7, and the web's demo link pointing at it in HTTP mode.

### Modified Capabilities

## Impact

- `api/`: the `/room` endpoint and the demo event seed. The existing `GET /events/:eventId/distribution` stays for the host screen.
- `web/`: only configuration (the demo event id and the API URL). No schema change, because the API now matches `web/src/api/schemas.ts`.
- Depends on `create-event`. `quiz-and-answers` replaces the stubbed joined count with Participation's real one.
- Owner: Adrián.
