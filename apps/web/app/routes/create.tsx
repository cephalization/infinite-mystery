import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { FormText, FormTextArea } from "~/components/atoms/FormInput";
import { Route } from "~/components/layouts/Route";
import { Scroller } from "~/components/layouts/Scroller";
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

    await createForm(user.id, form);

    return redirect("/explore");
  } catch (e) {
    console.error(e);
    return json({ success: false }, { status: 400 });
  }
};

const Create = () => {
  const { user } = useLoaderData<typeof loader>();

  return (
    <Route user={user}>
      <Scroller className="mt-8 pb-8">
        <form className="space-y-6" action="#" method="POST">
          <div className="bg-neutral px-4 py-5 shadow sm:rounded-lg sm:p-6">
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
          </div>

          <div className="bg-neutral px-4 py-5 shadow sm:rounded-lg sm:p-6">
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
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" className="btn">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </Scroller>
    </Route>
  );
};

export default Create;
