# Dev board

- **Status:** built (2026-10-15)
- **Owner:** Kinzey

## Problem

We are a two-person team with no tracker. Work items lived in chat prompts, which agents cannot reliably discover, so every session re-explained the same open threads. A lightweight in-app tracker keeps the queue where the work happens and gives agents a single place to read and update tasks.

## Who it serves

Founders (Developer role) only. It is development tooling, not a church-facing feature.

## Workflow

Today: tasks live in conversation and prompt files. In ChristOnline: the dev board at `/dev/board` lists tickets as cards across Backlog / In Progress / In Review / Done. Clicking a card opens a modal with details and actions (edit, move, delete). The route only renders when the app is served from localhost — it is not reachable in a deployed build.

## In scope / out of scope

**In scope:** ticket CRUD, status moves, starter tickets seeded from `prompt.md`, open on localhost without login.

**Out of scope:** church-facing work tracking, assignment flows, auth gating, drag-and-drop (cards move via buttons for now).

## Data and screens

- `devTicket` table (backend, defined with Confect). Holds no church or member data — development tickets only.
- Screen: `/dev/board` board; modal for ticket details.

## Open questions

- Should the board survive to launch as an internal ops tool, or be removed before churches use the product? (Ticket exists in the board.)
- Before launch, the dev-task backend functions must be internalized so they are not part of the public API (they are deliberately open for localhost convenience today).

## Decisions

- Board is dev-only and localhost-gated: see the feature decision in [decisions.md](../decisions.md).

## Canvas

Not needed — single screen.