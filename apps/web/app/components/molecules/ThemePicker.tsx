import { useEffect } from "react";
import { themeChange } from "theme-change";

const themes = ["coffee", "dark", "synthwave", "dracula", "night"];

export const ThemePicker = () => {
  useEffect(() => {
    if (document) {
      themeChange(false);
    }
  }, []);

  return (
    <div className="form-control w-full items-start">
      <label className="label" htmlFor="theme-picker">
        <span className="label-text">Theme</span>
      </label>
      <select
        id="theme-picker"
        className="select select-bordered w-full"
        data-choose-theme
        defaultValue={
          typeof document !== "undefined"
            ? Array.from(document.getElementsByTagName("html"))
                .at(0)
                ?.getAttribute("data-theme") ?? "coffee"
            : "coffee"
        }
      >
        <option disabled>Choose a theme</option>
        {themes.map((t) => (
          <option value={t} key={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
};
