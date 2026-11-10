import { Show, createSignal } from "solid-js";

import type { RoleView } from "~/library/game-types";
import { alignmentLabel, isEvilRole } from "~/library/game-types";

/*
 * A player's phone, which is a window and not a controller.
 *
 * Face down by default: a phone lying on a table must not advertise what it is.
 * One tap shows the card, one tap hides it again. The ability text is the exact
 * published wording — a player reading a paraphrase would learn a different game
 * (docs/design/principles.md).
 */
export function RoleCard(props: { role: RoleView }) {
  const [revealed, setRevealed] = createSignal(false);
  const evil = () => isEvilRole(props.role);

  return (
    <div class="rounded-2xl border border-line bg-card p-6">
      <Show
        when={revealed()}
        fallback={
          <button
            class="w-full rounded-xl border border-dashed border-line bg-surface px-4 py-12 text-center"
            onClick={() => setRevealed(true)}
          >
            <p class="text-sm font-medium text-ink">Tap to see your character</p>
            <p class="mt-1 text-xs text-muted">Keep it to yourself. You can hide it again.</p>
          </button>
        }
      >
        <div class="space-y-4">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-muted">
              {evil() ? "You are evil" : "You are good"}
            </p>
            <h2 class="mt-1 text-3xl font-bold text-ink">{props.role.name}</h2>
            <p class="mt-1 text-sm text-muted">{alignmentLabel(props.role)}</p>
          </div>

          <p class="text-base leading-relaxed text-ink">{props.role.ability}</p>

          <button
            class="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-muted hover:border-accent hover:text-accent"
            onClick={() => setRevealed(false)}
          >
            Hide
          </button>
        </div>
      </Show>
    </div>
  );
}
