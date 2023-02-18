// app/routes/login.tsx
import type { LoaderArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { SocialsProvider } from "remix-auth-socials";
import { Route } from "~/components/layouts/Route";
import { authenticator } from "~/server/auth.server";

interface SocialButtonProps {
  provider: SocialsProvider;
  label: string;
}

export const loader = async ({ request }: LoaderArgs) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });

  return new Response();
};

const SocialButton = ({ provider, label }: SocialButtonProps) => (
  <Form action={`/auth/${provider}`} method="post">
    <button className="btn btn-wide">{label}</button>
  </Form>
);

export default function Login() {
  return (
    <Route user={null}>
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex-col btn-group gap-4">
          <SocialButton
            provider={SocialsProvider.DISCORD}
            label="Login with Discord"
          />
          <SocialButton
            provider={SocialsProvider.GOOGLE}
            label="Login with Google"
          />
        </div>
      </div>
    </Route>
  );
}
