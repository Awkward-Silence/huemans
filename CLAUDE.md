# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

**huemans** is a web app to help people "break the ice" at events using colors. The repo is at the **pre-implementation stage**: there is no application code, tech stack, build, lint or test tooling yet. The only product input is `initial-raw-specs.md` (raw brainstorm notes). Once a stack is chosen, add its build/test/single-test commands here and record it in `openspec/config.yaml` under `context:`.

## Product vision (from `initial-raw-specs.md`)

Problem: at an event where you don't know anyone — especially as an introvert — it's hard to start a conversation.

Core flow:
1. **QR code as entry point** — scanning it joins the attendee to the event (web-based, no install).
2. **Timed questionnaire** — max **20 seconds** to answer a few multiple-choice questions (e.g. favourite colors, "do you like Julio Iglesias?"). Text answers are offered as pre-filled options drawn from a large (10,000+) database of funny questions/answers.
3. **Matching** — an algorithm computes **% match** between attendees at the same event; each attendee ends up associated with a **color**.
4. **Icebreaker mechanics** (still TBD, candidates):
   - a single shared question for the whole evening that people ask each other;
   - "LED scroller" mode: full-screen phone showing your color, held above your head;
   - color gatherings ("all the reds meet in the beer corner in 5 minutes");
   - opt-in 1:1 match with a specific attendee.
5. **Profile enrichment** — before matching, attendees may add interests/tags (e.g. technologies); the app shows infographics about who is attending.
6. **After the event** — encourage continuing contact (after-party, follow-up conversations).
7. **Leverage existing acquaintances** — people who already know someone can be used to introduce others.

Open questions to resolve via specs rather than assume: which icebreaker modes ship first, the matching algorithm, identity/accounts (anonymous vs. registered), and how event organizers create events/QR codes.

## Spec-driven workflow (OpenSpec)

This repo uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) (`schema: spec-driven`). Features are designed as change proposals before any code is written:

- `openspec/specs/` — current source-of-truth capability specs (empty for now).
- `openspec/changes/<name>/` — in-flight changes (proposal, design, delta specs, tasks); `openspec/changes/archive/` holds completed ones.
- `openspec/config.yaml` — project context and per-artifact rules fed to the AI when generating artifacts.

Lifecycle, via the skills/commands in `.claude/`: `/opsx:explore` (think through an idea) → `/opsx:propose` (create a change with all artifacts) → `/opsx:apply` (implement its tasks) → `/opsx:sync` (merge delta specs into `openspec/specs/`) → `/opsx:archive`.

Useful CLI commands: `openspec list`, `openspec list --specs`, `openspec show <change>`, `openspec status --change <name>`, `openspec validate` / `openspec validate --specs`.
