# UI foundation

Where ChristOnline's shared components come from, and why we did not adopt an off-the-shelf library yet. Written for a SWE audience; pairs with [brand.md](brand.md)-driven tokens in `packages/design/src/tokens.css`.

## The question (2026-10-15)

Should we build components on **solid-ui** (shadcn-style, Kobalte/corvu-based), **Kobalte** directly, or roll our own primitives? This blocks even small things like the dev board's ticket modal.

## Ecosystem reality on Solid 2

The app runs `solid-js 2.0.0-rc.14`. Checked 2026-10-15:

- **Kobalte** ships `@kobalte/core` 0.13.x for Solid 1.x. Solid 2 support exists only as `2.0.0-alpha.3` pre-releases (Solid 2 RC fixes were landing in October 2026). It works, but alphas mean breaking changes.
- **solid-ui** is Kobalte/corvu-based and currently targets the Solid 1.x lineage; the Solid 2 story depends on the Kobalte 2.0 line maturing.
- **corvu** carries Solid 2 work on its `corvu-next` branch, not yet a stable release surface.
- Solid 1.x component packages break on Solid 2 (e.g. `solid-js/web` import splits), confirming the instinct that v1-era libraries cannot be dropped in.

## Decision

1. **Build the first primitives in-house**, in `apps/app/src/components/ui/`, styled purely from brand tokens. Start with the ones the product actually needs (Dialog first). Keep them headless-ish: small, composable props, no theme system to fight.
2. **Revisit adoption when Kobalte 2.0 reaches stable.** Kobalte is the a11y/wiring layer solid-ui builds on; adopting Kobalte 2 later (solo or under solid-ui patterns) remains the target. In-house primitives should be written so a swap is mechanical: brand styling stays in one place per component.
3. **No Storybook for now.** A two-person team does not need a second app to maintain. Instead, a dev-mode component gallery page (served like the dev board, localhost-only) shows every primitive against brand tokens, on-design review included. If the gallery pattern proves limiting, Storybook stays a cheap later add.

See `technical/decisions.md` for the dated entries.