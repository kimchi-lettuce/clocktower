# Dev board

The in-app development task board: the team's ticket tracker for ChristOnline work itself. See [docs/product/features/dev-board.md](../../docs/product/features/dev-board.md).

## Intent

Keep development work items in one place agents and founders can see while working on the product; no separate tracker, no tasks living only in prompts.

## Ownership

Kinzey. This domain holds development tickets only — never church or member data.

## Invariants

- Tickets reference development work only (titles/descriptions about ChristOnline development). The starter queue seeds from the reviewed prompt backlog; church or personal content must never be entered here.
- Functions are deliberately public and unauthenticated because the board is reachable only on localhost. This must be internalized behind the Developer role before launch — see the ticket on the board itself.
- Ticket status is one of `backlog | in-progress | in-review | done`; `order` sequences tickets within a column, assigned server-side from the column's current tail.
- Seeding (`seedStarter`) only populates an empty board; existing tickets are never overwritten.