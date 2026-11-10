// Vite+ workspace-level config: test, lint, and format scoping for `vp check`
// and `vp test` run at the root. App-specific Vite settings (Solid, TanStack
// Router, Tailwind) live in apps/app/vite.config.ts.
//
// NOTE: `vp build` / `vp dev` run per app package; this file only governs the
// workspace-wide commands. confect/** engine tests are not collected yet - add them when the first
// real engine suite exists (see the dev board).
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
    include: ["apps/*/src/**/*.{test,spec}.{ts,tsx}", "packages/*/src/**/*.{test,spec}.{ts,tsx}"],
    passWithNoTests: true,
  },
});
