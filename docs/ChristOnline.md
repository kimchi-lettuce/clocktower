# ChristOnline — Project Idea and Setup

## Product idea

ChristOnline is a new all-in-one church management system (CMS), built with Daniel Chin.

The idea is not to collapse the two historical products. ChristOnline is the next generation that can inherit the proven parts of each:

- **CrossCheck / cross-check-core** — community knowledge hub, resource recommendations, trust-weighted voting, and personal notes with hybrid search.
- **Church Welcoming / Attendance App / welcoming-church-app** — live Sunday check-in, welcoming flows, role-scoped access, and warden-approved privacy governance.

Historically these remain separate projects. ChristOnline can carry the operational experience from the attendance app and the knowledge/resources work from CrossCheck into one coherent church platform.

## Current starting point

- **Remote repo:** `https://github.com/kimchi-lettuce/christ-online`
- **GitHub repo:** `https://github.com/kimchi-lettuce/christ-online`
The codebase starts from the TanStack Router example:

- Local clone: `projects/christ-online`
- Upstream repo: `https://github.com/tanstack/router`
- Starting example: `examples/solid/start-convex-better-auth`
- Example README: `examples/solid/start-convex-better-auth/README.md`

The example provides:

- **TanStack Start** with **Solid** server rendering and file-based routes.
- **TanStack Router** with a typed route tree.
- **Convex** as the backend and database.
- **Better Auth** integrated through `@convex-dev/better-auth`.
- A minimal `numbers` schema as an end-to-end test surface.

## Existing work to link to

The prior projects are documented in the vault:

- `[[Portfolio - CrossCheck Attendance]]`
- `[[Privacy and Data Governance Brief for Wardens]]`
- `[[Data Presentation Meeting]]`

These notes are useful for understanding the operational history, access model, and current user workflows that ChristOnline should learn from.

## Local setup

From `projects/christ-online/examples/solid/start-convex-better-auth`:

```bash
pnpm i
pnpx convex dev
pnpx convex env set SITE_URL http://localhost:3000/
pnpx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
pnpx convex dev
pnpm run dev
```

The example README documents the same steps.

## Next steps

1. Confirm the example builds and the Convex auth flow works locally.
2. Map the future domain model for ChristOnline.
3. Decide which legacy flows to port first.
4. Define the first vertical slice.
5. Keep architecture boundaries and a strong privacy plan from the start.

## Backlinks
- [Git for Daniel](Git%20for%20Daniel.html) — non-technical introduction to Git, commit, push, and pull.

- `[[Portfolio - CrossCheck Attendance]]`
- `[[Privacy and Data Governance Brief for Wardens]]`
- `[[Data Presentation Meeting]]`
- `[[AGENTS]]` for vault/project conventions.
