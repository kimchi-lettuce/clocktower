# Convex AGENTS.md

Clocktower's backend is the `convex/` Convex deployment with the Confect/Effect typed authoring layer in the sibling `confect/` directory (why: the 2026-10-15 verified tooling decision in [docs/technical/decisions.md](../docs/technical/decisions.md) — `confect codegen` hardcodes the sibling layout and destroys authoring files under any other arrangement).

## Read first

1. [`docs/AGENTS.md`](../docs/AGENTS.md)
2. [`docs/technical/convex-backend-standard.md`](../docs/technical/convex-backend-standard.md)
3. [`convex/_generated/ai/guidelines.md`](./_generated/ai/guidelines.md)

## Backend layout

```text
confect/            # authoring home — do NOT hand-edit convex/ codegen output
  tables/           # one Table.make file per table; filename = table name
  <domain>/…        # function groups: <name>.spec.ts + <name>.impl.ts pairs
  betterAuth.ts     # hand-maintained Better Auth wiring (http.ts imports it)
  _generated/       # conffect CLI output. Do not edit.

convex/             # Convex functions directory = conffect codegen target
  _generated/       # Convex CLI output. Do not edit.
  schema.ts         # codegen-managed (re-exports confect/_generated/convexSchema)
  *.ts              # codegen-managed per-group modules (e.g. devboard.ts)
  http.ts           # hand-maintained: Better Auth HTTP routes + CORS
  auth.config.ts    # hand-maintained: JWT provider configuration
  convex.config.ts  # hand-maintained: component mounting (betterAuth)
  tsconfig.json     # hand-maintained; also covers confect/ via its include
```

Function groups map to domains (e.g. `confect/devboard/` — the dev board). Plain Convex function files may live beside a group in `confect/` when a component or integration requires them (see Confect's "Plain Convex Functions" docs).

## Group shape

- `<domain>/README.md`: required — the domain's intent, ownership, and invariants. The folder reads as self-contained.
- **People-data domains** (personal information about members, visitors, attendance, notes, rosters) additionally require, before the domain ships:
  - `<domain>.policies.ts` — who may see and do this domain's things (role vocabulary from [rbac-tenancy-design.md](../docs/technical/rbac-tenancy-design.md)).
  - `<domain>.projections.ts` — role-scoped read models; reads of people data return the reduced form, never a raw document.
    These are fixed rules, not judgment calls: privacy failures are silent, so agents must not opt out mid-feature.
- `<name>.spec.ts`: `GroupSpec` with `FunctionSpec`s — args/returns (and optional typed errors) as Effect schemas, and shared constants/contracts. Must not value-import `@confect/server`.
- `<name>.impl.ts`: `GroupImpl` Effect layer per function, `GroupImpl.finalize` as the completeness check. Import Effect from submodule paths (`effect/Effect`, not the barrel).
- Cross-domain reach-throughs are a review failure: an impl may only open tables its own domain owns; cross-domain behavior goes through the owning domain's declared functions.
- Run `pnpm exec confect codegen` after adding or changing tables, specs, or impls (requires Node ≥ 24: `export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"`).

## Code behavior

- Keep one domain one directory; avoid reaching into another domain's tables.
- Add deeper layers (policies, projections, services) only when real complexity justifies them; privacy-sensitive output shaping belongs in an explicit projections module.
- Enforce authorization server-side before reading or writing data.

## Known exceptions to treat carefully

- `confect/devboard/` is deliberately public and unauthenticated (the localhost-only dev board; see [docs/product/features/dev-board.md](../docs/product/features/dev-board.md)). It must be internalized behind the Developer role before launch — ticket lives on the board itself.
- `confect/myFunctions/` is the migrated starter demo; it survives until the dashboard demo is replaced.

## Before finishing

Typecheck with `node node_modules/typescript/lib/tsc.js -p convex/tsconfig.json --noEmit` (backend) and `pnpm --filter @clocktower/app build` (frontend). Commit in small logical slices; do not rename files or create branches as a side effect of unrelated work.
