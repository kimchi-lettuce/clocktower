import { ConvexClient } from "convex/browser";
import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from "convex/server";
import {
  createContext,
  createMemo,
  createSignal,
  onSettled,
  useContext,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import { authClient } from "~/library/auth-client";

const ConvexContext = createContext<ConvexClient | undefined>();

export function ConvexProvider(props: {
  client: ConvexClient;
  children: JSX.Element;
}) {
  return <ConvexContext value={props.client}>{props.children}</ConvexContext>;
}

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string;

if (!CONVEX_URL) {
  throw new Error("VITE_CONVEX_URL is required");
}

export const convexClient = new ConvexClient(CONVEX_URL, {
  expectAuth: true,
});

export function refreshAuth() {
  const fetchToken = async () => {
    const response = await authClient.convex.token({
      fetchOptions: { throw: false },
    });
    return response.data?.token ?? null;
  };

  convexClient.setAuth(fetchToken);
}

export function clearAuth() {
  convexClient.client.clearAuth();
}

refreshAuth();

function useConvexClient() {
  const client = useContext(ConvexContext);
  if (!client) {
    throw new Error("ConvexClient must be used within ConvexProvider");
  }
  return client;
}

export function useQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: FunctionArgs<Query>,
) {
  const client = useConvexClient();
  const [data, setData] = createSignal<FunctionReturnType<Query> | undefined>();
  const [error, setError] = createSignal<Error | undefined>();

  onSettled(() => {
    const unsubscribe = client.onUpdate(
      query,
      args,
      (next) => {
        setData(() => next);
        setError(undefined);
      },
      (nextError) => {
        setError(nextError);
        setData(undefined);
      },
    );
    return () => unsubscribe();
  });

  return {
    data,
    error,
    isLoading: createMemo(() => data() === undefined && error() === undefined),
  };
}
