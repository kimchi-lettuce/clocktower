# Architecture

ChristOnline starts from the TanStack Router Solid Start + Convex + Better Auth example, per the upstream attribution in the repo README. Product motivation lives in [product/vision.md](../product/vision.md); this page explains how the system is built.

## Stack

- pnpm workspace with per-package frontends: `apps/app` (the browser SPA) and `apps/marketing` (a static site), plus `packages/design` for shared brand tokens
- TanStack Router with Solid and file-based routes, used as a browser-only SPA without app-server SSR (inside `apps/app`)
- Convex as the backend and database, with Effect/Confect typing, staying at the workspace root in `convex/`
- Backend organization follows [the Convex backend standard](convex-backend-standard.md)
- Better Auth integrated through `@convex-dev/better-auth`, so auth tables and HTTP routes run inside Convex; the package is used by both the backend (server side) and `apps/app` (client plugins)
- Solid 2 RC with the project-owned adapter in `apps/app/src/library/convex-client.tsx`

## Toolchain (Vite+)

The repo uses Vite+ (`vite-plus` 1.3.0 / the `vp` CLI from `node_modules/.bin`) as the single dev toolchain; the pnpm override aliases the `vite` package to Vite+'s bundled core, and standalone `vite` has **no binary anymore** — never invoke bare `vite`, use `vp` commands:

- Dev/build per app: `vp dev` / `vp build` (app's `build` script adds `tsc --noEmit`); workspace-wide via root scripts `pnpm run build` (`vp run -r build`), `pnpm run dev`
- One quality gate: `vp check` (Oxfmt + Oxlint + typecheck; `--fix` to auto-fix) and `vp test` (Vitest)
- Config: workspace-root `vite.config.ts` governs test/lint/fmt scoping; app Vite plugins (Solid, TanStack Router, Tailwind) stay in `apps/app/vite.config.ts`
- Details and follow-ups: the "Vite+ as the unified toolchain" entry in [decisions.md](decisions.md)

## Repository layout

```
apps/app/        browser SPA (Solid + TanStack Router + Convex client)
apps/marketing/  static marketing site (plain HTML/CSS, no framework)
packages/design/ shared CSS tokens used by both apps
convex/          backend, workspace root so the Convex CLI and its deps stay together
```

Env vars live in the workspace root `.env.local` / `.env.example` and are shared: `apps/app/vite.config.ts` points `envDir` at the root so Vite reads the same file the Convex CLI does.

## Solid 2 adapter

- Because the app uses Solid 2 RC, component-level subscriptions are mounted inside `onSettled` and the returned cleanup must be the unsubscribe function itself. A cleanup like `onSettled(() => unsubscribe())` would immediately dispose the subscription. Use `onSettled(() => { const unsubscribe = ...; return () => unsubscribe(); })` so the callback runs once and the cleanup is returned.

## The frontend is the runtime, not the app server

The browser runs the UI. Convex runs product data. The app server no longer provides an SSR runtime or a general API proxy. This keeps the SPA simple and avoids duplicate authorization paths.

## Auth wiring today

- `convex/auth.ts` defines Better Auth inside Convex with the Convex plugin; `convex/auth.config.ts` declares the JWT provider so Convex can verify tokens.
- `src/library/auth-client.ts` points Better Auth at the Convex HTTP endpoints and enables the package-supported cross-domain session mode.
- `src/library/convex-client.tsx` fetches the Convex JWT through Better Auth and gives it to `ConvexClient`; `ConvexClient` is configured with `expectAuth` for the primary authenticated app surface.
- The old `/api/auth` app-server proxy and TanStack server functions have been removed.
- The browser client is configured in `src/library/convex-client.tsx`, with a token fetched from the auth wiring.
- Product data flows call Convex directly so the browser -> Convex path stays short. The browser origin is allowlisted, while Convex functions remain the real authorization boundary; see [decisions.md](decisions.md).

## The current flow

1. The browser loads the SPA.
2. Better Auth stores the cross-domain session in its supported browser storage.
3. `ConvexClient` requests the Convex JWT from Better Auth.
4. Product queries and mutations call Convex directly with that JWT.
5. Convex functions remain the real security and ownership boundary.

## Working on Convex code

Read [`convex-backend-standard.md`](convex-backend-standard.md) and [`convex/AGENTS.md`](../../convex/AGENTS.md) before backend work. Always read `convex/_generated/ai/guidelines.md` first while editing generated code or Convex runtime wiring, per the repo-level AGENTS.md.
