# ChristOnline

ChristOnline is an all-in-one church management system (CMS), developed with Daniel Chin. It brings together lessons from the CrossCheck community knowledge hub and the Church Welcoming / attendance app.

This repository starts from the [TanStack Router Solid Start + Convex + Better Auth example](https://github.com/TanStack/router/tree/main/examples/solid/start-convex-better-auth). The starter provides the initial technical foundation; ChristOnline is not yet a complete church management product.

## Stack

- [TanStack Router](https://tanstack.com/router) with [Solid](https://solidjs.com/) as a browser-only SPA, in `apps/app`
- [Convex](https://www.convex.dev/) as the backend and database, in `convex/`
- [Better Auth](https://www.better-auth.com/) integrated through `@convex-dev/better-auth`
- [Confect](https://github.com/rjdellecese/confect) for Effect-typed Convex functions
- [Effect v4](https://effect.website/docs/v4/onboarding) for typed effects, services, and platform integration
- A static marketing site in `apps/marketing` and shared brand tokens in `packages/design`

## Repository layout

```text
apps/app/        the church app (Solid SPA)
apps/marketing/  the static marketing site
packages/design/ shared CSS tokens and brand assets
convex/          the Convex backend
docs/            product, design, and technical docs
```

## Run locally

1. Install [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/).
2. Install workspace dependencies:

   ```bash
   pnpm install
   ```

3. Copy the environment template at the workspace root (shared by the app, the marketing site, and the Convex CLI):

   ```bash
   cp .env.example .env.local
   ```

4. Start Convex and follow its prompts to create or connect a development deployment:

   ```bash
   pnpm run convex:dev
   ```

   The Convex development process updates `VITE_CONVEX_URL` and `VITE_CONVEX_SITE_URL` in `.env.local`. Keep this terminal open.

5. In a separate terminal, configure the site URL and auth secret in Convex:

   ```bash
   pnpm exec convex env set SITE_URL http://localhost:3000/
   pnpm exec convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
   ```

6. Start the local web app:

   ```bash
   pnpm run dev
   ```

   Open the URL reported by Vite (normally <http://localhost:3000>).

To work on the marketing site instead, run:

```bash
pnpm run dev:marketing
```

## Deployment

Two Vercel projects are connected to this one repo:

| Project | Root directory | Domain |
| --- | --- | --- |
| Marketing | `apps/marketing` | `christonline.com` / `www.christonline.com` |
| App | `apps/app` | `app.christonline.com` |

Each project builds its own package independently, so marketing deploys do not rebuild the app and vice versa.

## Project notes

- [ChristOnline project overview](./docs/ChristOnline.md)
- [Git for Daniel](./docs/Git%20for%20Daniel.html)

Do not commit secrets or real church/member data.
