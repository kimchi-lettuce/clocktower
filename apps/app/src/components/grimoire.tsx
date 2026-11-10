import { For, Show } from "solid-js";

import type { StorytellerView } from "~/library/game-types";
import { isEvilRole } from "~/library/game-types";

/*
 * The Storyteller's overview (docs/design/principles.md #3): where am I?
 *
 * Read-only on purpose. Every change the rules allow goes through the wizard, so
 * there is exactly one place that can refuse an illegal move. The one thing this
 * screen must never do is lie: the Drunk's believed role is shown next to the
 * truth, because the Storyteller is the person who has to keep that lie straight.
 */
export function Grimoire(props: { view: StorytellerView }) {
  return (
    <div class="rounded-lg border border-line bg-card p-5">
      <div class="flex items-baseline justify-between">
        <h2 class="text-base font-semibold text-ink">Grimoire</h2>
        <p class="text-xs text-muted">
          {props.view.aliveCount} alive · {props.view.voteThreshold} votes to execute
        </p>
      </div>

      <ul class="mt-3 space-y-2">
        <For each={props.view.grimoire}>
          {(seat) => (
            <li class="rounded-md border border-line bg-surface px-3 py-2">
              <div class="flex items-baseline justify-between gap-2">
                <span class="text-sm text-ink">
                  <span class="mr-2 font-mono text-xs text-muted">{seat.seatIndex}</span>
                  {seat.name}
                </span>
                <span class={isEvilRole(seat.role) ? "text-sm text-danger" : "text-sm text-accent"}>
                  {seat.role.name}
                </span>
              </div>

              <Show when={seat.believedRole.characterId !== seat.role.characterId}>
                <p class="mt-1 text-xs text-warning">
                  Thinks they are the {seat.believedRole.name} — wake them as that character.
                </p>
              </Show>

              <Show when={props.view.redHerringSeatIndex === seat.seatIndex}>
                <p class="mt-1 text-xs text-warning">Reads as a Demon to the Fortune Teller.</p>
              </Show>

              <Show when={!seat.alive}>
                <p class="mt-1 text-xs text-muted">
                  Dead{seat.ghostVoteAvailable ? " · ghost vote unspent" : " · ghost vote spent"}
                </p>
              </Show>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
