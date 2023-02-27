import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useTransition } from "@remix-run/react";
import clsx from "clsx";
import { FormText, FormTextArea } from "~/components/atoms/FormInput";
import { Route } from "~/components/layouts/Route";
import { Scroller } from "~/components/layouts/Scroller";
import { aiClient } from "~/server/ai.server";
import { authenticator } from "~/server/auth.server";
import { createForm, createFormSchema } from "~/server/database/create.server";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return json({ user });
};

export const action = async ({ request }: ActionArgs) => {
  try {
    const user = await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    });
    const form = createFormSchema.parse(await request.formData());
    const worldImage = aiClient.agents.worldImageGenerator({
      worldName: form.worldName,
      worldDescription: form.worldDescription,
    });
    const mysteryImage = aiClient.agents.mysteryImageGenerator({
      mysteryTitle: form.mysteryTitle,
      crime: form.mysteryCrime,
      worldDescription: form.worldDescription,
      worldName: form.worldName,
    });
    const images = (await Promise.allSettled([worldImage, mysteryImage]))
      .map((s) => (s.status === "fulfilled" ? s.value : undefined))
      .filter((s) => s);
    await createForm(user.id, form, {
      world: images[0] ?? undefined,
      mystery: images[1] ?? undefined,
    });

    return redirect("/explore");
  } catch (e) {
    console.error(e);
    return json({ success: false }, { status: 400 });
  }
};

const Create = () => {
  const { user } = useLoaderData<typeof loader>();
  const transition = useTransition();

  const loading = transition.state === "submitting";

  return (
    <Route user={user}>
      <Scroller className="mt-8 pb-8">
        <Form className="space-y-6" method="post">
          <fieldset
            disabled={loading}
            className="bg-neutral px-4 py-5 shadow sm:rounded-lg sm:p-6"
          >
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-primary">
                  World
                </h3>
                <p className="mt-1 text-sm text-neutral-content">
                  Create a new world for your mystery to take place in,
                  <br /> or set your mystery in an existing world.
                </p>
              </div>
              <div className="mt-5 space-y-6 md:col-span-2 md:mt-0">
                <FormText
                  name="worldName"
                  id="world-name"
                  label="Name"
                  required
                />
                <FormTextArea
                  name="worldDescription"
                  id="world-description"
                  label="Description"
                  description="This description should include the kind of world the mystery takes place in. Is it a dingy apartment building, a mystical forest, or a massive city-starship?"
                  required
                  maxSize="md"
                />
              </div>
            </div>
          </fieldset>

          <fieldset
            disabled={loading}
            className="bg-neutral px-4 py-5 shadow sm:rounded-lg sm:p-6"
          >
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-primary">
                  Mystery
                </h3>
                <p className="mt-1 text-sm text-neutral-content">
                  Create your mystery
                </p>
              </div>
              <div className="mt-5 md:col-span-2 md:mt-0">
                <FormText
                  name="mysteryTitle"
                  id="mystery-title"
                  label="Title"
                  required
                  description="Name of the mystery. Try something eye-catching and intriguing."
                />
                <FormTextArea
                  name="mysteryCrime"
                  id="mystery-crime"
                  label="Crime"
                  description="Full description of the crime, from an omniscient perspective. You should include the answers to questions like: Who did the crime? How did they do it? Why did they do it? Who saw them do it? The more information the better."
                  required
                  maxSize="md"
                />
                <FormTextArea
                  name="mysteryBrief"
                  id="mystery-brief"
                  label="Brief"
                  description="The information the player has about the crime at the beginning of the game. This should include the question the player is trying to answer, and point them in the direction of the first leads."
                  required
                  maxSize="md"
                />
              </div>
            </div>
          </fieldset>

          <div className="flex justify-end gap-4">
            <Link to="/explore" className="btn" aria-disabled={loading}>
              Cancel
            </Link>
            <button
              type="submit"
              className={clsx("btn btn-primary", loading && "loading")}
              disabled={loading}
            >
              Save
            </button>
          </div>
        </Form>
      </Scroller>
    </Route>
  );
};

export default Create;
