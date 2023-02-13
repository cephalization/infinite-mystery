type Variables = Record<string, string | string[]>;

/**
 * Replace a string of lite-templated variables with actual variables
 *
 * @example
 * // "My name is Tony"
 * replacer("My name is {name}", { name: "Tony" })
 * // "My hobbies are
 * // - games
 * // - coding"
 * replacer("My hobbies are\n[hobbies]", { hobbies: ["games", "coding"]})
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
    const value = variables[key];
    const valueIsArray = Array.isArray(value);
    const accessor = valueIsArray ? `[${key}]` : `{${key}}`;

    if (text.includes(accessor)) {
      const formattedValue = valueIsArray
        ? value.map((v) => `- ${v}`).join("\n")
        : value;
      text = text.replaceAll(accessor, formattedValue);
    }
  }

  return text;
};
