import { api } from "convex/_generated/api";
import type { FunctionArgs, FunctionReturnType } from "convex/server";
import { For, Show } from "solid-js";

import { deviceKey } from "~/library/guest";
import { useGuestMutation, useGuestQuery } from "~/library/guest-client";

/*
 * The night wizard: one step at a time, in the printed order, with the printed
 * instruction. This is the screen that replaces the night-order sheet in the
 * Storyteller's hands.
 *
 * The Storyteller taps their own phone, then talks to a player who has their eyes
 * closed. Nothing here waits on a player's device.
 */

type GameId = FunctionArgs<typeof api.game.games.view>["gameId"];
type NightView = NonNullable<FunctionReturnType<typeof api.game.games.night>>;

export function NightPanel(props: { gameId: GameId }) {
  const night = useGuestQuery(api.game.games.night, {
    gameId: props.gameId,
    deviceKey: deviceKey(),
  });
  const setStep = useGuestMutation(api.game.games.setNightStep);

  const move = (delta: number) => {
    const view = night.data();
    if (!view) return;
    const next = view.stepIndex + delta;
    if (next < 0 || next >= view.steps.length) return;
    void setStep.run({ gameId: props.gameId, deviceKey: deviceKey(), stepIndex: next });
  };

  return (
    <Show
      when={night.data()}
      fallback={
        <div class="rounded-lg border border-line bg-card p-5">
          <p class="text-sm text-muted">Loading the night…</p>
        </div>
      }
    >
      {(view: () => NightView) => {
        const step = () => view().steps[view().stepIndex];
        return (
          <div class="rounded-lg border border-line bg-card p-5">
            <div class="flex items-baseline justify-between">
              <h2 class="text-base font-semibold text-ink">Night {view().nightNumber}</h2>
              <p class="text-xs text-muted">
                {view().stepIndex + 1} of {view().steps.length}
              </p>
            </div>

            <Show when={step()}>
              {(current) => (
                <div class="mt-4 rounded-xl border border-line bg-surface p-4">
                  <p class="text-xs font-medium uppercase tracking-wide text-muted">
                    {current().synthetic
                      ? "Everyone still asleep"
                      : `Wake ${current().seatName ?? "a player"}`}
                  </p>
                  <h3 class="mt-1 text-2xl font-bold text-ink">{current().roleName}</h3>
                  <p class="mt-3 text-sm leading-relaxed text-ink">{current().instruction}</p>
                  <Show when={current().ability}>
                    {(ability) => (
                      <p class="mt-3 border-t border-line pt-3 text-xs text-muted">{ability()}</p>
                    )}
                  </Show>
                </div>
              )}
            </Show>

            <div class="mt-4 flex gap-2">
              <button
                class="flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-muted hover:border-accent hover:text-accent disabled:opacity-40"
                disabled={view().stepIndex === 0 || setStep.pending()}
                onClick={() => move(-1)}
              >
                Back
              </button>
              <button
                class="flex-1 rounded-md border border-line bg-accent-soft px-3 py-2 text-sm font-medium text-accent hover:border-accent disabled:opacity-40"
                disabled={view().stepIndex >= view().steps.length - 1 || setStep.pending()}
                onClick={() => move(1)}
              >
                Next
              </button>
            </div>

            <ol class="mt-4 space-y-1">
              <For each={view().steps}>
                {(entry, index) => (
                  <li
                    class={[
                      "flex items-center gap-2 text-xs",
                      index() === view().stepIndex ? "text-ink" : "text-muted",
                    ]}
                  >
                    <span class="w-4 text-right font-mono">{index() + 1}</span>
                    <span>{entry.roleName}</span>
                    <Show when={entry.seatName}>
                      {(name) => <span class="text-muted">· {name()}</span>}
                    </Show>
                  </li>
                )}
              </For>
            </ol>
          </div>
        );
      }}
    </Show>
  );
}

/** What a player's phone shows all night: almost nothing, and dim on purpose. */
export function EyesClosed(props: { nightNumber: number }) {
  return (
    <div class="rounded-lg border border-line bg-[var(--brand-night-surface)] p-8 text-center">
      <p class="text-sm font-medium text-[var(--brand-night-ink)]">Night {props.nightNumber}</p>
      <p class="mt-2 text-xs text-[var(--brand-night-ink)]">
        Eyes closed. The Storyteller will come to you if you need to wake.
      </p>
    </div>
  );
}
