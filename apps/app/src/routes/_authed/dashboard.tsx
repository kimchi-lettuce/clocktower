import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { useQuery } from "~/library/convex-client";
import { api } from "convex/_generated/api";
import { For, Show } from "solid-js";
import { convexClient, clearAuth } from "~/library/convex-client";
import { authClient, clearBetterAuthStorage } from "~/library/auth-client";

export const Route = createFileRoute("/_authed/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data, error } = useQuery(api.myFunctions.listNumbers, { count: 10 });

  const handleAddNumber = async () => {
    await convexClient.mutation(api.myFunctions.addNumber, {
      value: Math.floor(Math.random() * 100),
    });
  };

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
              <h1 class="text-2xl font-bold text-ink">Dashboard</h1>
              <p class="text-sm text-muted mt-1">Numbers sync directly from Convex.</p>
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
        <div class="bg-card rounded-lg border border-line p-6 md:p-8 mb-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-ink">Numbers</h2>
            <button
              onClick={handleAddNumber}
              class="px-4 py-2 text-sm font-semibold text-white bg-accent rounded-md hover:bg-accent/90 transition-colors duration-200"
            >
              Add Random Number To Convex
            </button>
          </div>

          {error() && (
            <div class="p-3 mb-4 text-sm text-danger bg-danger/10 border border-danger/20 rounded-md">
              {error()?.message}
            </div>
          )}

          <Show
            when={data()?.numbers && data()!.numbers.length > 0}
            fallback={
              <div class="text-center py-12">
                <h3 class="mt-2 text-sm font-medium text-ink">No numbers yet</h3>
                <p class="mt-1 text-sm text-muted">Get started by adding your first number.</p>
              </div>
            }
          >
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <For each={data()?.numbers}>
                {(number) => (
                  <div class="bg-accent-soft rounded-md p-4 text-center border border-line hover:border-accent transition-colors duration-200">
                    <div class="text-2xl font-bold text-accent">{number}</div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </div>
    </main>
  );
}
