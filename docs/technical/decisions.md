## 2026-10-17 — Vite+ as the unified toolchain

- **Decision:** ChristOnline standardizes on Vite+ (`vite-plus` 1.3.0 / the `vp` CLI) as the single toolchain: `vp dev` / `vp build` per app, `vp run -r build` for the workspace, `vp check` for format + lint + type checks, and `vp test` (Vitest) for tests. pnpm overrides alias `vite@*` to `@voidzero-dev/vite-plus-core@1.3.0` and pin `vitest@*` to Vite+'s bundled 5.0.5, so every `vite` import and Vercel build command resolves to the same core. A workspace-root `vite.config.ts` (using `defineConfig` from `vite-plus`) scopes test/lint/fmt; app Vite settings stay in `apps/app/vite.config.ts`.
- **Why:** Vite+/Rolldown core was already effectively adopted (Vite 8); Vite+ fills the repo's total lack of linter, formatter, and test runner with one dependency and one config surface, plus cached monorepo task runs. Cheaper than separately adopting and version-aligning Oxlint, Oxfmt, and Vitest.
- **Consequence:** There is no standalone `vite` binary anymore (`vite-plus-core` ships no bin) — scripts and docs must call `vp dev` / `vp build`, never bare `vite`. Vitest's peer range flags the aliased core as a (cosmetic) mismatch. Vercel builds run `vp build && tsc --noEmit`; verify on the next deploy that the workspace-root `node_modules` (where `vp` lives) is present in the build container.
- **Considered and rejected:** Standalone Oxlint + Vitest instead of Vite+ (same net result, three more pinned deps and separate configs to align); waiting (the tooling gap grows with every session without a check gate).
- **Follow-ups:** ① 27 files are not Oxfmt-clean including Daniel's in-flight WIP — run `vp check --fix` only after his WIP lands, not as part of this change. ② `confect/*.spec.ts` are WIP stubs (no tests inside); they are excluded from `test.include` until real suites exist. ③ Confirm the Vercel build path resolves `vp` from the workspace root.

## 2026-10-15 — In-house UI primitives until Kobalte 2.0 stabilizes

- **Decision:** ChristOnline builds its first UI primitives (Dialog and onward) in-house under `apps/app/src/components/ui/`, styled from brand tokens, with no Storybook; a localhost-only component gallery may serve as the review surface.
- **Why:** The app runs Solid 2 RC. Kobalte's Solid 2 line is still `2.0.0-alpha`, solid-ui targets the Solid 1 lineage, and v1-era packages break on Solid 2 — so no off-the-shelf foundation is stable enough to adopt today while the platform itself is RC.
- **Considered and rejected:** Installing `@kobalte/core` 2.0 alpha now (breaking changes mid-development); Storybook (a second app to maintain for a two-person team); staying on Solid 1 for library compatibility (the platform choice was already made and logged).
- **Consequence:** Primitives stay small and headless-ish so swapping their internals for Kobalte 2.0 stable later is mechanical. Revisit the question when Kobalte 2.0 ships stable.
- **More detail:** [../design/ui-foundation.md](../design/ui-foundation.md)

## 2026-10-15 — Confect v10 layout: root `confect/` directory (verified against the tooling)

- **Decision:** The backend adopts Confect 10 as the typed authoring layer with Confect's own layout: a root `confect/` directory (tables, `*.spec.ts`/`*.impl.ts` function groups) with `convex/` as Confect's codegen target, replacing the earlier plan of authoring Confect code inside `convex/`. The 2026-10-09 "no root `confect/`" rule is superseded.
- **Why:** `confect codegen` hardcodes its authoring directory as the sibling of the Convex functions directory (`path.join(path.dirname(convexDir), "confect")` in the CLI source) — it is not configurable. We attempted the one alternative that could collapse the pair into one folder (`convex.json` `{"functions": "confect"}`, making the functions dir and the Confect dir coincide): codegen treats those functions-dir files as managed codegen output and **deletes the authoring sources** (tables, specs, impls) — verified in a sandbox on 2026-10-15. Fighting the tool's only supported layout costs more than adopting it.
- **Considered and rejected:** Keeping Confect code hand-written inside `convex/` (no codegen support — the CLI never finds it); pinning Convex functions dir to `confect/` itself (destructive — see above); downgrading to an older Confect designed for the `convex/`-authored layout (loses the version the project pinned on 2026-10-09 and its Effect 4 support).
- **Consequence:** Backend authoring moves to `confect/` group files; `convex/` files authored by Confect must not be hand-edited. The Better Auth wiring (`confect/betterAuth.ts`, `convex/auth.config.ts`, `convex/http.ts`, `convex/convex.config.ts`) stays hand-maintained runtime configuration, with `convex/http.ts` importing the wiring from `confect/betterAuth.ts` because the CLI reserves the `convex/auth.ts` module name. Domain naming follows the standard; groups map to domains (e.g. `confect/devboard/`).
- **More detail:** [convex-backend-standard.md](convex-backend-standard.md)

## 2026-10-09 — Browser-only SPA with direct Convex data

- **Decision:** ChristOnline ships Solid 2 + TanStack Router as a browser-only SPA. Product queries and mutations call Convex directly from the browser; Better Auth runs as a Convex-hosted HTTP service using its cross-domain plugin.
- **Why:** Convex already owns persistence, validation, auth, and realtime. A second app-server hop for ordinary data added complexity without improving the product. Direct calls make the runtime simpler and keep the reactive path short.
- **Obstacles encountered:** The starter's auth flow depended on an SSR-era server proxy for cookies and token issuance. The first SPA conversion left stale `@tanstack/solid-start` imports and a broken `/api/auth` route, so authenticated Convex calls failed. We removed that app-server boundary and switched to Better Auth's cross-domain mode, with CORS and explicitly trusted app origins.
- **Considered and rejected:** A fresh SSR template (the product does not currently need app-server rendering); routing all product calls through server functions (that recreates the hop we are removing); allowing all origins/ports (`CORS` should be an explicit, minimal allowlist, not a blanket setting).
- **More detail:** [architecture.md](architecture.md)

## 2026-10-09 — Cross-domain Better Auth for an SPA

- **Decision:** Better Auth runs on Convex `convex/http.ts`, exposes CORS-authenticated HTTP routes, and uses Better Auth's cross-domain client plugin. The SPA points to those Convex endpoints and obtains the Convex JWT via `authClient.convex.token()`.
- **Why:** The SPA and auth service are different origins. Browser cookies alone cannot carry the session between them, so the package-supported cross-domain mode handles that boundary while keeping auth in Convex.
- **Obstacles encountered:** The starter's server function and `/api/auth` proxy were tied to SSR-era wiring. Once the SPA was made client-only, those paths no longer worked and authenticated Convex calls failed.
- **Considered and rejected:** Keeping a generic auth proxy just for login (it would leave an avoidable app-server dependency); storing raw tokens by hand (it bypasses the supported auth package); allowing every origin (unsafe and pointless beyond `CORS`).
# Technical decisions

Dated architecture and implementation decisions. Newest first.

## 2026-10-11 - Separate static marketing site in a pnpm workspace

- **Decision:** ChristOnline splits into a pnpm workspace: `apps/app` (the Solid SPA), `apps/marketing` (a plain static site), and `packages/design` (shared CSS tokens). `convex/` stays at the workspace root. Deployment is two Vercel projects rooted at `apps/marketing` (apex domain) and `apps/app` (app subdomain), each building its own package from the one repo.
- **Why:** Marketing pages change often and carry heavy assets; keeping them out of the app bundle stops signed-in users paying that cost, and lets marketing deploy independently of app deploys.
- **Considered and rejected:** Marketing routes inside the SPA (one deploy, but coupled bundles and releases); a separate repo for marketing (coordination overhead for no extra isolation).
- **More detail:** [architecture.md](architecture.md)

## 2026-10-09 — Confect-first Convex domain modules

- **Decision:** ChristOnline keeps `convex/` as the canonical backend directory and organizes backend code into domain modules. Confect and Effect provide typed schemas, contracts, and services inside that backend; they do not become a separate Confect backend surface.
- **Why:** A domain-oriented Convex monolith gives agents and maintainers stable file seams without losing Convex transactions, reactive reads, or the generated API path.
- **Consequence:** Generated code remains under `convex/_generated/`; Confect artifacts remain an implementation detail. Domain names may be renamed only when the product language has settled, but the structural seams should stay stable.
- **More detail:** [convex-backend-standard.md](convex-backend-standard.md)

## 2026-10-09 — Direct Convex calls for frontend data

- **Decision:** Browser-driven frontend reads, mutations, and actions call Convex functions directly. TanStack server functions are reserved for request-time SSR, auth-token resolution, browser cookies, server-only secrets, and response-side redirects.
- **Why:** Convex already authenticates calls and provides reactive subscriptions. Adding an app-server hop for ordinary CRUD makes each flow slower to reason about and maintain. Direct calls keep the browser -> Convex path obvious, and the login token still comes through the server-aware auth wiring.
- **Considered and rejected:** Routing all frontend calls through TanStack server functions. That would couple product flows to the app server even when no request-scoped logic is needed.
- **More detail:** [architecture.md](architecture.md)

## 2026-10-09 - Solid 2 `onSettled` cleanup for Convex subscriptions

- **Decision:** Keep the Solid 2 Convex adapter using `onSettled` and return the `onUpdate` unsubscribe function from that callback.
- **Why:** Solid 2 uses `onSettled` for component lifecycle; an immediately-invoked cleanup would dispose the subscription before it fires and leave reactive UI blank.
- **More detail:** [architecture.md](architecture.md)

## 2026-10-09 — One local Convex/Solid adapter

- **Decision:** ChristOnline uses `src/library/convex-client.tsx` as the project-owned bridge between Convex and Solid 2, rather than the old `convex-solidjs` package.
- **Why:** `convex-solidjs` is still Solid 1.x and references `solid-js/web`, which no longer exists in the Solid 2 package split. The local adapter is small enough that the project can keep its typed wrapper without dragging the app back to an incompatible runtime.
- **Consequence:** The adapter is part of ChristOnline's maintenance surface. If Convex changes its browser API, update the adapter. If a maintained Solid 2 package appears, revisit whether to adopt it.
- **More detail:** [architecture.md](architecture.md)

## 2026-10-09 — One shared Convex backend client

- **Decision:** Server-side functions reuse a single Convex client, attaching each request's own login token before a call and sending mutations immediately rather than through the client's waiting line.
- **Why:** Building a fresh client per call wasted work. Sharing one client without per-call tokens could send one person's login with another request's data, so the per-request token attach and the queue-skip go together.
- **More detail:** `src/library/auth-server.ts`
