import { defineConfig } from "vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import solid from "@solidjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Shared env file lives at the workspace root so the app and the Convex CLI
  // read from one place.
  envDir: "../../",
  server: { port: 3000 },
  resolve: { tsconfigPaths: true },
  plugins: [
    tanstackRouter({ target: "solid", autoCodeSplitting: true }),
    tailwindcss(),
    solid({ ssr: false }),
  ],
});
