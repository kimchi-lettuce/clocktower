# Domains

Domain modules own ChristOnline's operational concepts and their data. Each domain keeps its tables, contracts, and functions together.

- Read the [backend standard](../../docs/technical/convex-backend-standard.md) before adding a domain.
- Each domain should contain its own `README.md`, `schema.ts` when it owns tables, `contracts.ts`, and `functions.ts`.
- Cross-domain access must be explicit through the owning domain's contracts or internal functions.
- Do not invent or commit domain names until their product language is agreed.
