# huemans

A web app to get to know people using colors.

You arrive at an event and don't know anyone. Scan a QR code, answer a few silly questions in 20 seconds, and huemans drops you into a **color group** of like-minded people. Raise your phone to show your color, and when the host calls it, meet your group with a ready-made icebreaker question.

Built in a 24h hackathon.

## How it works

1. The host screen shows a QR code for the event.
2. Attendees scan it and answer a 20-second multiple-choice quiz. No sign-up needed.
3. Everyone is assigned to a color group based on their answers.
4. Phones go full-screen in their color (LED mode) so groups can find each other.
5. The host triggers a gathering: "All REDS to the bar corner in 5 minutes", and each group gets an icebreaker question.
6. AI agents add the fun on top: group names, tailored icebreakers and live stats on the big screen.

## Stack

| Part | Tech |
| --- | --- |
| `web/` | React (attendee app + host big screen) |
| `api/` | NestJS, with Mastra agents running in-process |
| `contracts/` | Shared TypeScript types (type-only imports, no dependencies) |

Each app installs its own dependencies.

## Team

| Name | Role | Owns |
| --- | --- | --- |
| Adrián | Architect | Contracts, Grouping (core domain), integration and deploy |
| Diego | Backend | Questionnaire: question bank, 20s deadline, answers |
| Miguel | Fullstack | Event + QR, host big screen, realtime gathering |
| Daniel | Frontend | Attendee mobile flow: join, quiz, color reveal, LED mode |

## Docs

- [Next steps / hackathon plan](docs/next-steps.md)
- [Raw product ideas](initial-raw-specs.md)
- Specs and changes live in [`openspec/`](openspec/)
