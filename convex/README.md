# ChristOnline Convex backend

This directory is ChristOnline's Convex backend and database layer.

The backend is organized as a Convex-centric domain monolith. Confect and Effect provide the typed authoring layer, while Convex remains the runtime and public API surface.

- Architecture standard: [`docs/technical/convex-backend-standard.md`](../docs/technical/convex-backend-standard.md)
- Agent conventions: [`convex/AGENTS.md`](./AGENTS.md)
- Generated code: [`convex/_generated/`](./_generated/)

Do not edit `convex/_generated/` manually. Follow [`convex/AGENTS.md`](./AGENTS.md) and the Convex-generated guidelines before changing backend code.
