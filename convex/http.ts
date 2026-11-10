import { httpRouter } from "convex/server";
import { authComponent, appOrigin, createAuth, localAppOrigins } from "../confect/betterAuth";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth, {
  cors: {
    allowedOrigins: [appOrigin, ...localAppOrigins],
    allowedHeaders: ["Content-Type", "Better-Auth-Cookie", "Authorization"],
    exposedHeaders: ["Set-Better-Auth-Cookie"],
  },
});

export default http;
