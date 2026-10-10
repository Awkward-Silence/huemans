# Proposal

## Why

The flow ends with ONE icebreaker shared by everyone that night. That gives every attendee the same opening line to approach anyone in the room. It should fit the people actually present, and revealing it is the climax of a 2-3 minute live demo, so the presenter needs to control when it happens.

## What Changes

- Add a host action to close the event: status moves from `OPEN` to `REVEALED`. This only happens once.
- On close, aggregate the trait profiles of all attendees into a room profile and pick the catalog icebreaker whose traits best match it. The choice is stored on the event and does not change afterwards.
- Broadcast the icebreaker in realtime to every attendee and the host screen. Attendees who reload or arrive after the reveal get it from their state.
- Late joiners can still answer and get a color after the reveal, but they don't change the chosen icebreaker.

## Capabilities

### New Capabilities
- `night-icebreaker`: closing an event, selecting the single icebreaker from the room's trait profile, and delivering it to everyone.

### Modified Capabilities

## Impact

- New host endpoint in `api/` (close event), an event status field, and a realtime broadcast whose shape goes into `contracts/`.
- Host screen (Miguel) gets the "reveal icebreaker" button, and the attendee flow (Daniel) gets the final icebreaker screen.
- Depends on `event-join-and-answers` and `backend-skeleton-and-catalog`.
- Owner: Adrián.
