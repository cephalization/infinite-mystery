type Variables = Record<string, string | string[]>;

const transformArrayToString = (value: string[]) =>
  value.map((v) => `- ${v}`).join("\n");

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
export const replacer = <T extends Variables>({
  template,
  variables,
  canShorten,
  maxLength = 3488,
}: {
  template: string;
  variables: T;
  canShorten?: keyof T;
  /**
   * Prompt will be shortened until it hits this amount
   *
   * It should be gte 4000 - max_tokens
   */
  maxLength?: number;
}) => {
  const keys = Object.keys(variables) as (keyof Variables)[];

  const arrayTypedKeys = [];
  let text = template;
  for (const key of keys) {
    const value = variables[key];
    const valueIsArray = Array.isArray(value);
    if (valueIsArray) {
      arrayTypedKeys.push(key);
      continue;
    }
    const accessor = `{${key}}`;

    if (text.includes(accessor)) {
      text = text.replaceAll(accessor, value);
    }
  }

  for (const key of arrayTypedKeys) {
    let value = variables[key] as string[];
    const accessor = `[${key}]`;
    let transformedValue = transformArrayToString(value);

    while (
      canShorten === key &&
      text.replaceAll(accessor, transformedValue).length >= maxLength
    ) {
      if (value.length === 1) {
        break;
      }
      console.log(`Shortening ${key} to ${value.length - 1} entries`);
      const [_oldest, ...restOfValues] = value;
      value = restOfValues;
      transformedValue = transformArrayToString(value);
    }

    text = text.replaceAll(accessor, transformedValue);
  }

  return text.trim();
};
