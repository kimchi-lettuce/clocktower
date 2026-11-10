import { createAuthClient } from "better-auth/client";
import { convexClient, crossDomainClient } from "@convex-dev/better-auth/client/plugins";

const baseURL = import.meta.env.VITE_CONVEX_SITE_URL as string;

if (!baseURL) {
  throw new Error("VITE_CONVEX_SITE_URL is required");
}

export const authClient = createAuthClient({
  baseURL,
  plugins: [convexClient(), crossDomainClient()],
});

const betterAuthCookieKey = "better-auth_cookie";
const betterAuthSessionDataKey = "better-auth_session_data";

export function clearBetterAuthStorage() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(betterAuthCookieKey);
    window.localStorage.removeItem(betterAuthSessionDataKey);
  }
}
