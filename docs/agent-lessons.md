# Agent lessons

Lessons from real sessions that changed how agents work in this repo. Newest first, one entry per lesson, each entry one or two sentences.

This file stays short on purpose. It is read at the start of nontrivial work, so every entry costs context on every future session. The bar for adding an entry is deliberately high.

## The bar

A lesson is recorded only when all three hold:

1. **It caused a real mistake or correction.** Not a hypothetical risk, not a preference, not something that merely could have gone wrong.
2. **It is durable.** It will apply to future sessions, not just the state of the code on the day it happened.
3. **It is not captured elsewhere.** If it is an implementation detail, it belongs in the commit message. If it is a durable choice, it belongs in [product/decisions.md](product/decisions.md) or [technical/decisions.md](technical/decisions.md). If it applies to all agents in every repo, it belongs in a skill or global instructions, not here.

If the answer to "should this be a lesson?" is not an easy yes, the answer is no.

## Format

- **Date:** YYYY-MM-DD
- **Lesson:** one sentence, phrased as an instruction to a future agent
- **Story:** one sentence on what went wrong (only if needed to understand the instruction)

## Pruning

When a lesson becomes redundant — absorbed into docs, fixed in code, or covered by a template — delete the entry. This file should shrink as often as it grows.

## Entries

(None yet. The Convex shared-client fix of 2026-10-09 was considered and rejected as an entry: it is already recorded in the decision log, so a duplicate here would only cost context.)
