// app/server/auth.server.ts
import { Authenticator } from "remix-auth";
import { GoogleStrategy, SocialsProvider } from "remix-auth-socials";
import { DiscordStrategy } from "remix-auth-socials";
import { sessionStorage } from "~/server/session.server";
import { serverConfig } from "./config.server";

/**
 * User Type
 *
 * @TODO determine what user information to grab from auth provider
 */
export type User = {
  displayName: string;
};

// Create an instance of the authenticator
export let authenticator = new Authenticator<User>(sessionStorage, {
  sessionKey: "_session",
});
// You may specify a <User> type which the strategies will return (this will be stored in the session)
// export let authenticator = new Authenticator<User>(sessionStorage, { sessionKey: '_session' });

const getCallback = (provider: SocialsProvider) => {
  return `${serverConfig.WEB_URL}/auth/${provider}/callback`;
};

authenticator.use(
  new GoogleStrategy(
    {
      clientID: serverConfig.GOOGLE_CLIENT_ID,
      clientSecret: serverConfig.GOOGLE_CLIENT_SECRET,
      callbackURL: getCallback(SocialsProvider.GOOGLE),
    },
    async ({ profile }) => {
      // @TODO look up or create user with google details
      return profile;
    }
  )
);

authenticator.use(
  new DiscordStrategy(
    {
      clientID: serverConfig.DISCORD_CLIENT_ID,
      clientSecret: serverConfig.DISCORD_CLIENT_SECRET,
      callbackURL: getCallback(SocialsProvider.DISCORD),
    },
    async ({ profile }) => {
      // @TODO look up or create user with discord details
      return profile;
    }
  )
);
