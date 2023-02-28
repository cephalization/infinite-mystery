import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { z } from "zod";
import { authenticator } from "~/server/auth.server";
import { prisma } from "~/server/prisma.server";

export const action = async ({ request, params }: ActionArgs) => {
  try {
    const user = await authenticator.isAuthenticated(request);
    invariant(user);
    const { mysterySessionId } = z
      .object({ mysterySessionId: z.coerce.number() })
      .parse(await request.json());
    const mysteryId = z.coerce.number().parse(params?.mysteryId);
    const userMysterySession = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        mysteryEventSessions: {
          where: {
            id: mysterySessionId,
            mysteryId,
          },
          select: {
            id: true,
          },
        },
      },
    });
    const validatedMysterySessionId =
      userMysterySession?.mysteryEventSessions.at(0)?.id;
    invariant(validatedMysterySessionId !== undefined);
    await prisma.mysteryEventSession.delete({
      where: {
        id: validatedMysterySessionId,
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
