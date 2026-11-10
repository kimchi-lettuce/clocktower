import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { authClient, clearBetterAuthStorage } from "~/library/auth-client";
import { clearAuth } from "~/library/convex-client";

export const Route = createFileRoute("/_authed/dashboard")({
  component: RouteComponent,
});

/*
 * Placeholder surface. The signed-in shell exists so the Convex/Better Auth
 * wiring stays exercised; the lobby, seat claim, and Storyteller grimoire
 * replace it. Email sign-up is not the product's identity model — guest
 * sessions are (docs/technical/decisions.md).
 */
function RouteComponent() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await authClient.signOut();
    clearBetterAuthStorage();
    clearAuth();
    navigate({ to: "/" });
  };

  return (
    <main class="min-h-screen">
      <header class="bg-card shadow-sm border-b border-line">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-ink">Clocktower</h1>
              <p class="text-sm text-muted mt-1">Nothing here yet: the game starts in the lobby.</p>
            </div>
            <div class="flex items-center gap-3">
              {window.location.hostname === "localhost" && (
                <a
                  href="/dev/board"
                  class="px-4 py-2 text-sm font-medium text-accent border border-line rounded-md hover:bg-accent-soft hover:border-accent transition-all duration-200 shadow-sm"
                >
                  Dev board
                </a>
              )}
              <button
                onClick={handleSignOut}
                class="px-4 py-2 text-sm font-medium text-ink bg-card border border-line rounded-md hover:bg-accent-soft hover:border-accent transition-all duration-200 shadow-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-card rounded-lg border border-line p-6 md:p-8">
          <h2 class="text-xl font-semibold text-ink">No game in progress</h2>
          <p class="mt-2 text-sm text-muted">
            The lobby is not built yet. The rules engine, tables, and tests are in place — see{" "}
            <code>docs/status.md</code> in the repo for what is next.
          </p>
        </div>
      </div>
    </main>
  );
}
