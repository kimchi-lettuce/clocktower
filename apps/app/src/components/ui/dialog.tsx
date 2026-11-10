import type { JSX } from "@solidjs/web";
import { Show, createEffect } from "solid-js";

/*
 * First in-house UI primitive (docs/design/ui-foundation.md): a modal Dialog
 * styled from brand tokens. Kept headless-ish and small so its internals can
 * later be swapped for Kobalte 2.0 stable without touching call sites.
 */

export interface DialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: JSX.Element;
}

export function Dialog(props: DialogProps) {
  createEffect(
    () => props.open,
    (open) => {
      if (!open) return;
      const onKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") props.onClose();
      };
      window.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", onKey);
        document.body.style.overflow = "";
      };
    },
  );

  return (
    <Show when={props.open}>
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label={props.title}
      >
        <div class="absolute inset-0 bg-ink/40" onClick={() => props.onClose()} />
        <div class="relative flex max-h-[85vh] w-full max-w-lg flex-col bg-card border border-line rounded-lg shadow-lg">
          <div class="flex items-start justify-between border-b border-line p-5">
            <h2 class="text-lg font-semibold text-ink">{props.title}</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={() => props.onClose()}
              class="rounded-md border border-line px-2 py-1 text-sm text-muted hover:bg-accent-soft hover:border-accent transition-colors duration-150"
            >
              ✕
            </button>
          </div>
          <div class="overflow-y-auto p-5 text-left">{props.children}</div>
        </div>
      </div>
    </Show>
  );
}
