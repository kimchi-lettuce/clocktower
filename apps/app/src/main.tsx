import { render } from "@solidjs/web";
import { RouterProvider, createRouter } from "@tanstack/solid-router";
import { routeTree } from "./routeTree.gen";
import "~/styles/app.css";
import AppConvexProvider from "~/providers/convex";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultErrorComponent: (err) => <p>{err.error.stack}</p>,
  defaultNotFoundComponent: () => <p>not found</p>,
  scrollRestoration: true,
});

declare module "@tanstack/solid-router" {
  interface Register {
    router: typeof router;
  }
}

render(
  () => (
    <AppConvexProvider>
      <RouterProvider router={router} />
    </AppConvexProvider>
  ),
  document.getElementById("app")!,
);
