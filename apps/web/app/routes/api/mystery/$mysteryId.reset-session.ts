import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { z } from "zod";
import { authenticator } from "~/server/auth.server";
import { getEventSessionByMysteryId } from "~/server/database/eventSession.server";
import { prisma } from "~/server/prisma.server";

export const action = async ({ request, params }: ActionArgs) => {
  try {
    const user = await authenticator.isAuthenticated(request);
    invariant(user);
    const mysteryId = z.coerce.number().parse(params?.mysteryId);
    const mysterySession = await getEventSessionByMysteryId({
      mysteryId,
      userId: user.id,
    });
    invariant(mysterySession);
    await prisma.mysteryEventSession.delete({
      where: {
        id: mysterySession.id,
      },
    });

    return json({ success: true });
  } catch (e) {
    console.error(e);

    return json(
      {
        success: false,
        error: "Could not reset mystery session",
        detail: e as Error,
      },
      { status: 400 }
    );
  }
};
