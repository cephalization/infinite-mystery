type Variables = Record<string, string>;

/**
 * Replace a string of lite-templated variables with actual variables
 *
 * @example
 * // "My name is Tony"
 * replacer("My name is {name}", { name: "Tony" })
 *
 * @param template - string upon which variables are injected
 * @param variables - variables to inject
 *
 * @returns text injected with variables
 */
export const replacer = (template: string, variables: Variables) => {
  const keys = Object.keys(variables) as (keyof Variables)[];

  let text = template;
  for (const key of keys) {
    const accessor = `{${key}}`;

    if (text.includes(accessor)) {
      text = text.replaceAll(accessor, variables[key]);
    }
  }

  return text;
};
