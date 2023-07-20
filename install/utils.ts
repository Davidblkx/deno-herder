import { colors, Input, join, toFileUrl, tty } from './deps.ts';
import { debug } from './logger.ts';
import { State, state } from './models.ts';

export { debug } from './logger.ts';

type Colors = typeof colors;
type ColorKeys = keyof Colors;

export function C<C extends ColorKeys>(
  key: C,
  message: string,
): Colors[C] extends (str: string) => string ? string : never {
  // deno-lint-ignore no-explicit-any
  return state.t.useColors ? (colors[key] as any)(message) : message;
}

export function E(e: string, alt = ''): string {
  return state.t.useEmojis ? e : alt;
}

export async function requestInput({
  message,
  flag,
  defaultValue,
  hint,
  minLength,
}: {
  message: string;
  flag: string;
  defaultValue?: string;
  hint?: string;
  minLength?: number;
}): Promise<string> {
  if (!state.t.interactive) {
    if (!defaultValue) {
      throw new Error(`${flag} flag is required in non-interactive mode!`);
    }
    return defaultValue;
  }

  return await Input.prompt({
    message,
    default: defaultValue,
    hint,
    minLength,
  });
}

export function saveTtyPosition() {
  const { x, y } = tty.getCursorPosition();

  return {
    cursor: { x, y },
    restore() {
      if (state.t.verbose) return;
      const newLines = tty.getCursorPosition().y - y;
      tty.cursorMove(0, -newLines);
      tty.eraseLine();
      tty.eraseDown(newLines);
    },
  };
}

export function wait(t = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, t));
}

export function getMachineConfigPath(s: State) {
  return join(s.p.homeFolder, s.p.configFileName);
}

export function getScriptsFolderPath(s: State) {
  return join(s.p.homeFolder, s.p.scriptsFolder);
}

export function getScriptsConfigPath(s: State) {
  return join(s.p.homeFolder, s.p.scriptsFolder, s.p.configFileName);
}

export async function isFile(path: string): Promise<boolean> {
  try {
    const stat = await Deno.stat(toFileUrl(path));
    return stat.isFile;
  } catch (err) {
    debug('isFile', err);
    return false;
  }
}

export async function isDirectory(path: string): Promise<boolean> {
  try {
    const stat = await Deno.stat(toFileUrl(path));
    return stat.isDirectory;
  } catch (err) {
    debug('isDirectory', err);
    return false;
  }
}

export async function machineConfigIsFile(s: State) {
  return await isFile(getMachineConfigPath(s));
}

export async function scriptFolderExists(s: State) {
  return await isDirectory(getScriptsFolderPath(s));
}
