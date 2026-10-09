# Proposal

## Why

The demo starts with someone scanning a QR code and ends with them answering a few funny questions. The backend needs an event to scan into, the event's fixed set of questions, and a place to store each attendee's name and answers so their traits can later decide their color.

## What Changes

- Create an event: it gets an id (the QR encodes the web URL containing it), a name, status `OPEN`, and 4-5 questions picked from the catalog. All attendees of the same event answer the same questions, so their answers are comparable.
- Prefer questions with varied themes, whose answers point to different colors, so the quiz actually separates people.
- Fetch an event with its questions and answers for the quiz screen.
- Join an event with just a name (no login). This returns an attendee id that the client keeps so a reload can resume.
- Submit answers. The timer is soft: late submissions are accepted, and the time taken is stored for fun stats. Submitting builds the attendee's trait profile and publishes `QuestionnaireCompleted`.
- Fetch an attendee's current state (answered? color? event status?) so the attendee screen survives reloads.

## Capabilities

### New Capabilities
- `event`: creating an event, selecting its questions, and exposing it to attendees.
- `participation`: joining an event with a name, submitting answers, the resulting trait profile, and recovering attendee state.

### Modified Capabilities

## Impact

- REST endpoints in `api/` used by the attendee flow (Daniel) and the host screen (Miguel), whose shapes go into `contracts/`.
- Publishes `QuestionnaireCompleted { eventId, attendeeId, answers[] }`, which `color-distribution` consumes.
- Depends on `backend-skeleton-and-catalog`.
- Owner: Diego.
