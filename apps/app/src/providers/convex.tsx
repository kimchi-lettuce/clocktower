import type { JSX } from "@solidjs/web";
import { ConvexProvider, convexClient } from "~/library/convex-client";

export default function AppConvexProvider(props: { children: JSX.Element }) {
  return <ConvexProvider client={convexClient}>{props.children}</ConvexProvider>;
}
