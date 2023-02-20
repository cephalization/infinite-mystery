import type { DiscordProfile, GoogleProfile } from "remix-auth-socials";
import { prisma, Prisma } from "../prisma.server";

type Provider = "google" | "discord";
type ProviderProfile = DiscordProfile | GoogleProfile;

const defaultUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  displayName: true,
  admin: true,
});

const withContentUserSelect = Prisma.validator<Prisma.UserSelect>()({
  ...defaultUserSelect,
  worlds: true,
  mysteries: true,
});

export const authenticateUser = (
  providerProfile: ProviderProfile,
  provider: Provider
) => {
  return prisma.user.upsert({
    where: {
      providerId: providerProfile.id,
    },
    create: {
      providerId: providerProfile.id,
      provider,
      displayName: providerProfile.displayName,
    },
    select: defaultUserSelect,
    update: {},
  });
};

export type AuthenticatedUser = Awaited<ReturnType<typeof authenticateUser>>;

export const getFullUser = (id: Prisma.UserWhereUniqueInput["id"]) =>
  prisma.user.findFirst({
    where: {
      id,
    },
    select: withContentUserSelect,
  });

export type FullUser = NonNullable<Awaited<ReturnType<typeof getFullUser>>>;
