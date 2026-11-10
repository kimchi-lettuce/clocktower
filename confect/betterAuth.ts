import { createClient } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { components } from "./_generated/components";
import type { GenericCtx } from "@convex-dev/better-auth";
import type { BetterAuthOptions } from "better-auth";
import type { DataModel } from "../convex/_generated/dataModel";
import authConfig from "../convex/auth.config";

/*
 * Better Auth integration wiring. Lives in the Confect tree because
 * `confect codegen` owns the convex/ directory and reserves its module names
 * (`auth` was removed); `convex/http.ts` (a codegen-untouched runtime file)
 * imports from here. The Better Auth component itself is mounted in
 * `convex/convex.config.ts` using the vanilla Convex API.
 */

const authApiUrl = process.env.CONVEX_SITE_URL!;
export const appOrigin = process.env.SITE_URL!;
export const localAppOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];
const trustedAppOrigins = [appOrigin, ...localAppOrigins];

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false },
) => {
  return betterAuth<BetterAuthOptions>({
    logger: {
      disabled: optionsOnly,
    },
    baseURL: authApiUrl,
    trustedOrigins: trustedAppOrigins,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      convex({
        authConfig,
        jwt: { expirationSeconds: 60 * 60 * 24 },
      }),
      crossDomain({
        siteUrl: appOrigin,
      }),
    ],
  });
};