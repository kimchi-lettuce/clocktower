// Vite+ workspace-level config: test, lint, and format scoping for `vp check`
// and `vp test` run at the root. App-specific Vite settings (Solid, TanStack
// Router, Tailwind) live in apps/app/vite.config.ts; apps/marketing needs none.
//
// NOTE: `vp build` / `vp dev` run per app package; this file only governs the
// workspace-wide commands. confect/*.spec.ts files are in-progress stubs and
// stay out of the test glob until they contain real suites.
import { defineConfig } from "vite-plus";

const generated = ["**/_generated/**", "**/dist/**", "**/node_modules/**"];

export default defineConfig({
  fmt: {
    ignorePatterns: [
      ...generated,
      "**/routeTree.gen.ts",
      "docs/**",
      "packages/design/src/tokens.css",
      "prompt.md",
    ],
  },
  lint: {
    ignorePatterns: generated,
  },
  test: {
    include: [
      "apps/*/src/**/*.{test,spec}.{ts,tsx}",
      "packages/*/src/**/*.{test,spec}.{ts,tsx}",
    ],
    passWithNoTests: true,
  },
});