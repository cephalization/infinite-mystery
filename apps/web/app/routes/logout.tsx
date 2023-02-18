// app/routes/logout.tsx
import type { ActionArgs } from "@remix-run/node";
import { authenticator } from "~/server/auth.server";

export const loader = async ({ request }: ActionArgs) => {
  await authenticator.logout(request, { redirectTo: "/" });
};

export const action = async ({ request }: ActionArgs) => {
  await authenticator.logout(request, { redirectTo: "/" });
};
