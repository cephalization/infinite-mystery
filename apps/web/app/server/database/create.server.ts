import type { z } from "zod";
import { zfd } from "zod-form-data";

import type { Prisma } from "../prisma.server";
import { prisma } from "../prisma.server";

export const createFormSchema = zfd.formData({
  worldName: zfd.text(),
  worldDescription: zfd.text(),
  mysteryTitle: zfd.text(),
  mysteryCrime: zfd.text(),
  mysteryBrief: zfd.text(),
});

export type CreateForm = z.infer<typeof createFormSchema>;

export const createForm = (
  userId: Prisma.UserWhereUniqueInput["id"],
  form: CreateForm,
  previewImgs: {
    mystery?: string;
    world?: string;
  } = {}
) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      worlds: {
        create: {
          name: form.worldName,
          description: form.worldDescription,
          previewImg: previewImgs.world,
          mysteries: {
            create: {
              userId,
              title: form.mysteryTitle,
              brief: form.mysteryBrief,
              crime: form.mysteryCrime,
              previewImg: previewImgs.mystery,
            },
          },
        },
      },
    },
    include: {
      worlds: true,
      mysteries: true,
    },
  });
};
