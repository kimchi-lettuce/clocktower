import { Outlet, createFileRoute, redirect } from "@tanstack/solid-router";
import { authClient } from "~/library/auth-client";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async () => {
    const session = await authClient.getSession();

    if (!session.data?.user) {
      throw redirect({ to: "/" });
    }
  },
  component: () => (
    <>
      <Outlet />
    </>
  ),
});
