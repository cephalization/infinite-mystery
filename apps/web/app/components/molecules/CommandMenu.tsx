import clsx from "clsx";
import React, { useEffect } from "react";

type CommandMenuProps = React.PropsWithChildren<{
  open?: boolean;
  value?: string;
  commands?: Command[];
  onSelect?: (command: Command) => void;
  setCommandMenuOpen?: (open: boolean) => void;
}>;

export type Command = {
  name: string;
  description?: string;
  action: () => void;
};

export const findClosestCommand = (
  value: string,
  commands: Command[],
  exact?: boolean
) => {
  if (!value || !commands || !commands.length) return;

  const commandValue = value.trim().split("/")[1];

  return commands.find(
    (command) =>
      commandValue &&
      (exact
        ? command.name === commandValue
        : command.name.startsWith(commandValue))
  );
};

export const CommandMenu = ({
  open,
  children,
  value = "",
  commands = [],
  onSelect,
  setCommandMenuOpen,
}: CommandMenuProps) => {
  const closestCommand = findClosestCommand(value, commands);

  useEffect(() => {
    // setup an event listener that will close the menu when the user clicks outside of it
    const handleClickOutside = (event: MouseEvent) => {
      if (!open) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      // bail out if the user clicked on the submit button
      if (target?.closest?.("button[name=action-submit]")) return;
      // bail out if the user clicked on the command menu
      if (target?.closest?.(".dropdown")) return;

      // otherwise, close the menu
      setCommandMenuOpen?.(false);
    };

    // setup an event listener that will close the menu when the user presses escape
    const handleEscape = (event: KeyboardEvent) => {
      if (!open) return;
      if (event.key !== "Escape") return;

      setCommandMenuOpen?.(false);
    };

    document.addEventListener("pointerup", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerup", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, setCommandMenuOpen]);

  if (!open) return <>{children}</>;

  return (
    <div className={clsx("dropdown dropdown-top dropdown-open")}>
      {children}
      <div
        tabIndex={0}
        className="dropdown-content menu p-2 shadow-lg bg-neutral rounded-lg w-72 min-h-16 mb-2"
      >
        <div className="menu-title">Commands</div>
        <ul>
          {commands.map((command) => (
            <li key={command.name}>
              <button
                className={clsx(
                  "flex flex-row justify-start w-full",
                  command === closestCommand && "bg-base-content bg-opacity-10"
                )}
                type="button"
                onClick={() => {
                  onSelect?.(command);
                  setCommandMenuOpen?.(false);
                }}
              >
                <div className="flex flex-col gap-1 h-full w-full items-baseline">
                  <div>{command.name}</div>
                  {command.description && (
                    <div className="opacity-50 flex flex-wrap w-full text-left">
                      {command.description}
                    </div>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
