import { createFileRoute } from "@tanstack/solid-router";
import { api } from "convex/_generated/api";
import type { FunctionArgs } from "convex/server";
import { For, Show, createMemo, createSignal } from "solid-js";

import { RoleCard } from "~/components/role-card";
import { Grimoire } from "~/components/grimoire";
import type { PlayerView, StorytellerView } from "~/library/game-types";
import { useGuestMutation, useGuestQuery } from "~/library/guest-client";
import {
  codeFromAddress,
  currentGameId,
  deviceKey,
  forgetGame,
  rememberGame,
  rememberName,
  rememberedName,
  shareLink,
} from "~/library/guest";

/*
 * The lobby: the whole of "I want to play" until the grimoire exists.
 *
 * Players never press anything during a game, so this screen is the only one a
 * player touches — which is why it is also the join flow: a code, a link, a name.
 * The Storyteller gets one extra control, the button that starts the game.
 */

export const Route = createFileRoute("/")({
  component: LobbyPage,
});

type GameId = FunctionArgs<typeof api.game.games.view>["gameId"];

function LobbyPage() {
  // localStorage holds a plain string; the server is the authority on whether the
  // game it names still exists, which is why an unknown id renders "looking…"
  // and then a way out rather than an error.
  const [gameId, setGameId] = createSignal<GameId | null>(
    (currentGameId() as GameId | null) ?? null,
  );

  const enter = (id: GameId) => {
    rememberGame(id);
    setGameId(id);
  };

  const leave = () => {
    forgetGame();
    setGameId(null);
  };

  return (
    <main class="min-h-screen bg-surface px-4 py-10">
      <div class="mx-auto max-w-md">
        <header class="mb-8">
          <h1 class="text-2xl font-bold text-ink">Clocktower</h1>
          <p class="mt-1 text-sm text-muted">
            One phone per player, one Storyteller. Nothing to install.
          </p>
        </header>

        <Show when={gameId()} keyed fallback={<Entry onEnter={enter} />}>
          {(id) => <Room gameId={id} onLeave={leave} />}
        </Show>
      </div>
    </main>
  );
}

function Entry(props: { onEnter: (gameId: GameId) => void }) {
  const [name, setName] = createSignal(rememberedName());
  const [code, setCode] = createSignal(codeFromAddress());
  const [problem, setProblem] = createSignal<string | null>(null);

  const join = useGuestMutation(api.game.games.join);
  const create = useGuestMutation(api.game.games.create);

  const trimmedName = () => name().trim();
  const trimmedCode = () => code().trim().toUpperCase();

  const handleJoin = async () => {
    if (!trimmedName()) return setProblem("Pick a name first.");
    if (trimmedCode().length < 4) return setProblem("That code looks too short.");

    rememberName(trimmedName());
    const result = await join.run({
      code: trimmedCode(),
      name: trimmedName(),
      deviceKey: deviceKey(),
    });

    if (!result) return setProblem("Could not reach the server.");
    if (!result.ok) {
      setProblem(
        result.reason === "no-such-game"
          ? `No game is using the code ${trimmedCode()}.`
          : result.reason === "locked"
            ? "That game has already started."
            : "That game is full.",
      );
      return;
    }

    setProblem(null);
    props.onEnter(result.gameId);
  };

  const handleCreate = async () => {
    if (!trimmedName()) return setProblem("Pick a name first.");
    rememberName(trimmedName());

    const created = await create.run({
      deviceKey: deviceKey(),
      scriptId: "trouble-brewing",
    });
    if (!created) return setProblem("Could not reach the server.");
    if (!created.ok) return setProblem("Could not make a room. Try again.");

    // The Storyteller is a seat at the table too, so take one.
    const seated = await join.run({
      code: created.code,
      name: trimmedName(),
      deviceKey: deviceKey(),
    });
    if (!seated || !seated.ok) return setProblem("Room made, but the seat was not.");

    setProblem(null);
    props.onEnter(created.gameId);
  };

  return (
    <div class="space-y-5">
      <label class="block">
        <span class="text-sm font-medium text-ink">Your name</span>
        <input
          class="mt-1 w-full rounded-md border border-line bg-card px-3 py-2 text-ink"
          value={name()}
          placeholder="What should the table call you?"
          maxlength={24}
          onInput={(event) => setName(event.currentTarget.value)}
        />
      </label>

      <div class="rounded-lg border border-line bg-card p-5">
        <h2 class="text-base font-semibold text-ink">Join a game</h2>
        <p class="mt-1 text-sm text-muted">Ask the Storyteller for the code.</p>
        <div class="mt-3 flex gap-2">
          <input
            class="w-full rounded-md border border-line bg-surface px-3 py-2 font-mono text-lg tracking-[0.2em] text-ink uppercase"
            value={code()}
            placeholder="CODE"
            maxlength={8}
            autocapitalize="characters"
            onInput={(event) => setCode(event.currentTarget.value)}
          />
          <button
            class="shrink-0 rounded-md border border-line bg-accent-soft px-4 py-2 text-sm font-medium text-accent hover:border-accent"
            disabled={join.pending()}
            onClick={handleJoin}
          >
            Join
          </button>
        </div>
      </div>

      <div class="rounded-lg border border-line bg-card p-5">
        <h2 class="text-base font-semibold text-ink">Start a game</h2>
        <p class="mt-1 text-sm text-muted">
          You run it as the Storyteller. Everyone else joins with the code.
        </p>
        <button
          class="mt-3 w-full rounded-md border border-line bg-accent-soft px-4 py-2 text-sm font-medium text-accent hover:border-accent"
          disabled={create.pending()}
          onClick={handleCreate}
        >
          Create a room
        </button>
      </div>

      <Show when={problem()}>{(message) => <p class="text-sm text-danger">{message()}</p>}</Show>
    </div>
  );
}

function Room(props: { gameId: GameId; onLeave: () => void }) {
  const view = useGuestQuery(api.game.games.view, {
    gameId: props.gameId,
    deviceKey: deviceKey(),
  });
  const start = useGuestMutation(api.game.games.start);
  const [startProblem, setStartProblem] = createSignal<string | null>(null);
  const [copied, setCopied] = createSignal(false);

  const room = createMemo(() => view.data());
  const isStoryteller = () => room()?.kind === "storyteller";
  const playerSeatIndex = () => {
    const current = room();
    return current?.kind === "player" ? current.yourSeatIndex : null;
  };
  const asPlayer = () => {
    const current = room();
    return current?.kind === "player" ? current : null;
  };
  const asStoryteller = () => {
    const current = room();
    return current?.kind === "storyteller" ? current : null;
  };
  const started = () => {
    const status = room()?.status;
    return status !== undefined && status !== "lobby";
  };
  const seated = () => room()?.seats.length ?? 0;
  const shareable = () => (room() ? shareLink(room()!.code) : "");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareable());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleStart = async () => {
    const result = await start.run({
      gameId: props.gameId,
      deviceKey: deviceKey(),
    });

    if (!result) return setStartProblem("Could not reach the server.");
    if (result.ok) return setStartProblem(null);

    setStartProblem(
      result.reason === "too-few-players"
        ? "You need at least five players."
        : (result.detail ?? "The game could not start."),
    );
  };

  return (
    <Show
      when={room()}
      fallback={
        <div class="rounded-lg border border-line bg-card p-5">
          <p class="text-sm text-muted">Looking for the room…</p>
        </div>
      }
    >
      {(current) => (
        <div class="space-y-5">
          <div class="rounded-lg border border-line bg-card p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-muted">Room code</p>
            <p class="mt-1 font-mono text-4xl tracking-[0.3em] text-ink">{current().code}</p>
            <p class="mt-2 text-sm text-muted">
              {current().status === "lobby"
                ? `${seated()} seated. Five is enough to start.`
                : current().status === "night"
                  ? `Night ${current().nightNumber}.`
                  : current().status === "day"
                    ? `Day ${current().dayNumber}.`
                    : "This game is over."}
            </p>
            <button
              class="mt-3 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-accent hover:border-accent"
              onClick={copyLink}
            >
              {copied() ? "Link copied" : "Copy the join link"}
            </button>
            <p class="mt-2 break-all text-xs text-muted">{shareable()}</p>
          </div>

          <Show when={started()}>
            <Show when={asPlayer()}>
              {(player: () => PlayerView) => <RoleCard role={player().yourRole} />}
            </Show>
            <Show when={asStoryteller()}>
              {(storyteller: () => StorytellerView) => <Grimoire view={storyteller()} />}
            </Show>
          </Show>

          <div class="rounded-lg border border-line bg-card p-5">
            <h2 class="text-base font-semibold text-ink">At the table</h2>
            <ul class="mt-3 space-y-2">
              <For each={current().seats}>
                {(seat) => (
                  <li class="flex items-center justify-between rounded-md border border-line bg-surface px-3 py-2">
                    <span class="text-sm text-ink">
                      <span class="mr-2 font-mono text-xs text-muted">{seat.seatIndex}</span>
                      {seat.name}
                      <Show when={playerSeatIndex() === seat.seatIndex}>
                        <span class="ml-2 text-xs text-accent">you</span>
                      </Show>
                    </span>
                    <Show when={!seat.alive}>
                      <span class="text-xs text-muted">dead</span>
                    </Show>
                  </li>
                )}
              </For>
            </ul>

            <Show when={current().kind === "spectator"}>
              <p class="mt-3 text-xs text-muted">You are watching this table, not seated at it.</p>
            </Show>
          </div>

          <Show when={isStoryteller() && current().status === "lobby"}>
            <div class="rounded-lg border border-line bg-card p-5">
              <h2 class="text-base font-semibold text-ink">Start the game</h2>
              <p class="mt-1 text-sm text-muted">
                Characters are dealt from the chart. Everyone's role appears on their own phone.
              </p>
              <button
                class="mt-3 w-full rounded-md border border-line bg-accent-soft px-4 py-2 text-sm font-medium text-accent hover:border-accent"
                disabled={start.pending() || seated() < 5}
                onClick={handleStart}
              >
                Deal and begin
              </button>
              <Show when={startProblem()}>
                {(message) => <p class="mt-2 text-sm text-danger">{message()}</p>}
              </Show>
            </div>
          </Show>

          <Show when={isStoryteller() && current().status !== "lobby"}>
            <div class="rounded-lg border border-line bg-card p-5">
              <p class="text-sm text-muted">
                The night wizard is the next screen. Until it exists, run the night from the printed
                order — the app already knows the sequence and what to say at each step.
              </p>
            </div>
          </Show>

          <button class="w-full text-sm text-muted underline" onClick={props.onLeave}>
            Leave this room
          </button>
        </div>
      )}
    </Show>
  );
}
