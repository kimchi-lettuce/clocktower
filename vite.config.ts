// Vite+ workspace-level config: test, lint, and format scoping for `vp check`
// and `vp test` run at the root. App-specific Vite settings (Solid, TanStack
// Router, Tailwind) live in apps/app/vite.config.ts.
//
// NOTE: `vp build` / `vp dev` run per app package; this file only governs the
// workspace-wide commands.
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
      // Engine tests. `.spec.ts` is reserved for Confect contracts, so engine
      // suites are `.test.ts` and are collected from confect/ too.
      "confect/**/*.test.ts",
    ],
    passWithNoTests: true,
  },
});
