import { ConvexClient } from "convex/browser";
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server";
import { createSignal, onSettled } from "solid-js";

/*
 * The lobby talks to Convex through an anonymous client.
 *
 * Better Auth exists in this repo because the fork used it, but the product has
 * no accounts: the game functions are public and identify a caller by device key.
 * Using a client that is not waiting for an auth token keeps the lobby reachable
 * on a phone that has never signed in to anything.
 */

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string;
if (!CONVEX_URL) {
  throw new Error("VITE_CONVEX_URL is required");
}

export const guestClient = new ConvexClient(CONVEX_URL);

export function useGuestQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: FunctionArgs<Query>,
) {
  const [data, setData] = createSignal<FunctionReturnType<Query> | undefined>();
  const [error, setError] = createSignal<Error | undefined>();

  onSettled(() => {
    const unsubscribe = guestClient.onUpdate(
      query,
      args,
      (next) => {
        setData(() => next);
        setError(undefined);
      },
      (nextError) => {
        setError(nextError as Error);
        setData(undefined);
      },
    );
    return () => unsubscribe();
  });

  return { data, error };
}

export function useGuestMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
) {
  const [pending, setPending] = createSignal(false);
  const [error, setError] = createSignal<Error | undefined>();

  const run = async (args: FunctionArgs<Mutation>) => {
    setPending(true);
    setError(undefined);
    try {
      return (await guestClient.mutation(mutation, args)) as FunctionReturnType<Mutation>;
    } catch (cause) {
      setError(cause as Error);
      return undefined;
    } finally {
      setPending(false);
    }
  };

  return { run, pending, error };
}
