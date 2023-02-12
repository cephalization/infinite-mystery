import { prisma } from "database";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async () => {
  return json({
    userCount: await prisma.user.count(),
  });
};

export default function Index() {
  const { userCount } = useLoaderData<typeof loader>();

  return (
    <div className="flex w-full p-8 flex-col gap-4">
      <h1 className="text-4xl">Welcome to your Infinite Adventure</h1>
      <p className="text-primary text-2xl">{userCount} Users</p>
    </div>
  );
}
