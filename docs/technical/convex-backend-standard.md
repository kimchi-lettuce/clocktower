# Convex backend standard

ChristOnline is a Convex backend. Confect and Effect are the typed authoring layer used within that backend, not a separate backend surface.

## Target layout

Confect 10 requires a root `confect/` directory and uses `convex/` as its codegen target (see the decision of 2026-10-15 in [technical/decisions.md](decisions.md)). Backend authoring lives in `confect/`; `convex/` holds generated output plus hand-maintained runtime configuration:

```text
confect/
  tables/                    # one Table per file; the filename is the table name
  <domain>/                  # function groups, one spec/impl pair per group
    <group>.spec.ts          # args/returns contracts (FunctionSpec)
    <group>.impl.ts          # handlers (FunctionImpl, Effect layers)
  _generated/                # Confect CLI output. Do not edit.

convex/
  AGENTS.md
  README.md

  _generated/

  auth.ts                    # hand-maintained: Better Auth + component wiring
  auth.config.ts             # hand-maintained
  convex.config.ts           # hand-maintained: component mounting
  http.ts                    # hand-maintained: Better Auth HTTP routes
  schema.ts, .../*.ts        # Confect codegen output. Do not hand-edit.
```

```text
convex/
  AGENTS.md
  README.md

  _generated/

  auth.ts
  auth.config.ts
  convex.config.ts
  http.ts
  schema.ts

  domains/
    <domain>/
      README.md
      contracts.ts
      functions.ts
      policies.ts       # optional
      projections.ts    # optional
      services.ts       # optional

  platform/
    <technical capability>/
      README.md
      contracts.ts
      functions.ts

  shared/
    <pure helper>.ts
```

Generated code lives under `confect/_generated/` and `convex/` (Confect's codegen target, per the 2026-10-15 decision above); the frontend keeps using the usual `convex/_generated` API surface.

## Domain principles

- The backend is one Convex deployment and one transactional system. Use domain modules, not microservices.
- Each table has exactly one owning domain.
- A domain owns its tables, contracts, functions, and invariants.
- Cross-domain reads and writes are explicit, not accidental table reach-throughs.
- Domain names are provisional until the ChristOnline product language is settled. Do not copy the welcoming project's domain names automatically.
- The root schema composes individual domain schemas. It should not become the long-term dump of every table definition.
- Platform code handles shared technical concerns such as storage, integrations, or HTTP plumbing. It should not own church-domain rules.

## Standard domain shape

A domain is a Confect function group under `confect/<domain>/`, one spec/impl pair per group, with the spec declaring args and returns as Effect schemas.

Required in every domain:

- **`README.md`** — the domain's intent, ownership, and invariants, one page. The folder must read as self-contained: an agent reviewing it can learn what lives here and its rules without opening another file.

Required in every domain that holds **people data** (anything touching persons — members, visitors, attendance, notes, rosters): the domain may not ship without these, regardless of how simple it seems:

- **`<domain>.policies.ts`** — who may see and do this domain's things, answered against the shared role vocabulary (see [rbac-tenancy-design.md](rbac-tenancy-design.md)).
- **`<domain>.projections.ts`** — what each role's responses may contain. Reads of people data return the role's reduced read model, never a raw document.

The point of fixing these as a rule rather than a judgment call: privacy failures are silent — no error, no failed test, just a wider response than someone should have received. A fixed rule cannot be argued around by an agent mid-feature.

Optional (add only when real complexity justifies the seam):

- `contracts.ts` (shared types/constants beyond what the spec already carries)
- `services.ts` (Effect services for reusable business workflows)

Domains without people data (platform tooling, dev-only features) stay at the minimal shape.

## Function rules

- Keep public functions thin.
- Validate every input and output with a typed contract where Confect is used.
- Prefer Effect schemas and Confect contracts over one-off validators and ad hoc shapes.
- Enforce authorization server-side before reading or writing data: people-data domains answer "who" in their policies module and "what comes back" in their projections module (see Standard domain shape).
- Use explicit projections for privacy-sensitive reads. Helper-facing responses must not accidentally return full member records.
- Avoid cross-domain direct table access. Route cross-domain behavior through the owning domain's explicit operations.

## Confect boundaries

- `confect/tables/` is the only place tables are declared; `confect/*.spec.ts` files declare every public function's args and returns as Effect schemas. Run `confect codegen` after adding or changing specs or tables.
- Confect's generated area (`confect/_generated/`) and the files codegen writes under `convex/` (including `convex/schema.ts` and the per-group modules) are generated output.
- Hand-maintained Convex-runtime configuration is limited to `convex/convex.config.ts`, `convex/tsconfig.json`, `convex/auth.ts`, `convex/auth.config.ts`, and `convex/http.ts` (the Better Auth integration). New backend logic must not be hand-written into `convex/` — it goes in a `confect/` group, even when the group wraps a plain Convex function via the Plain Convex Functions mechanism.
- Do not value-import `@confect/server` from anything a `*.spec.ts` reaches (specs bundle into the client); import Effect and Confect core from submodule paths (`effect/Schema`, not the `effect` barrel).
- The frontend keeps using `convex/_generated/api` function references; Confect's `refs` and its React hooks are not used because the app is Solid.
- Agent-facing guidance lives in [`convex/AGENTS.md`](../../convex/AGENTS.md); this page carries the architecture rationale.

## Agent workflow

When changing the backend:

1. Read [`AGENTS.md`](../../AGENTS.md), [`agent-lessons.md`](../agent-lessons.md), and `convex/_generated/ai/guidelines.md`.
2. Use the domain structure in this document.
3. Generate or update Convex/Confect types as instructed by the tooling.
4. Run the repository typecheck/build.
5. Show changed files and await explicit approval before any commit.

## Migration discipline

Use small, reviewable slices. The initial starter functions may remain at the Convex root until a natural domain migration slice is chosen. Do not perform a wholesale rewrite to "apply" this standard; move code when it can be named confidently under its owning domain.
