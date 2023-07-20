import { fromFileUrl, join, toFileUrl } from '../deps.ts';
import { debug } from '../logger.ts';
import { configParamMapKey, ParamsOptions, TAction } from '../models.ts';
import { APP_VERSION } from '../../version.ts';
import { state } from '../models.ts';

export const defaultImports = {
  '$deno/': 'https://deno.land/std@0.194.0/',
  '$cliffy/': 'https://deno.land/x/cliffy@v1.0.0-rc.2/',
};

export const defaultCompilerOptions = {
  'lib': [
    'deno.ns',
    'dom',
  ],
};

export const defaultFMT = {
  'indentWidth': 2,
  'lineWidth': 90,
  'singleQuote': true,
  'useTabs': false,
};

export function createFolder(path: string): TAction<'create-folder'> {
  const folderPath = toFileUrl(path);
  return {
    type: 'create-folder',
    description: `Create folder at ${path}`,
    execute: async () => {
      try {
        await Deno.mkdir(folderPath, { recursive: true });
        return true;
      } catch (err) {
        debug(`Error creating folder at ${path}`, err);
        return false;
      }
    },
  };
}

export function createConfigFile(
  path: string,
  {
    injectConfig = false,
    extraContent = {},
  }: {
    injectConfig?: boolean;
    extraContent?: Record<string, string | boolean | undefined>;
  } = {},
): TAction<'create-config-file'> {
  const content: Record<string, string | boolean | undefined> = {
    ...extraContent,
  };
  content.version = APP_VERSION;
  const fullPath = toFileUrl(path);
  return {
    type: 'create-config-file',
    description: `Create config file at ${path}`,
    execute: async () => {
      try {
        if (injectConfig) {
          // Evaluate moving this to the setup step
          for (const [key, value] of Object.entries(configParamMapKey)) {
            content[value] = state.p[key as keyof ParamsOptions];
          }
        }
        await Deno.writeTextFile(fullPath, JSON.stringify(content, null, 2));
        return true;
      } catch (err) {
        debug(`Error creating config file at ${path}`, err);
        return false;
      }
    },
  };
}

export function createDenoFile(folder: string): TAction<'create-deno-file'> {
  const fullPath = toFileUrl(join(folder, 'deno.json'));
  const content = {
    compilerOptions: defaultCompilerOptions,
    fmt: defaultFMT,
    imports: defaultImports,
  };

  return {
    type: 'create-deno-file',
    description: `Create deno file at ${fromFileUrl(fullPath)}`,
    execute: async () => {
      try {
        await Deno.writeTextFile(fullPath, JSON.stringify(content, null, 2));
        return true;
      } catch (err) {
        debug(`Error creating deno file at ${fromFileUrl(fullPath)}`, err);
        return false;
      }
    },
  };
}

export function updateConfigFile(
  path: string,
  {
    injectConfig = false,
    extraContent = {},
  }: {
    injectConfig?: boolean;
    extraContent?: Record<string, string | boolean | undefined>;
  } = {},
): TAction<'update-config-file'> {
  const content: Record<string, string | boolean | undefined> = {};
  content.version = APP_VERSION;
  const fullPath = toFileUrl(path);
  return {
    type: 'update-config-file',
    description: `Update config file at ${path}`,
    execute: async () => {
      try {
        if (injectConfig) {
          for (const [key, value] of Object.entries(configParamMapKey)) {
            content[value] = state.p[key as keyof ParamsOptions];
          }
        }

        const currentFile = await Deno.readTextFile(fullPath);
        const currentContent = JSON.parse(currentFile);

        const mergedContent = {
          ...currentContent,
          ...extraContent,
          ...content,
        };

        await Deno.writeTextFile(
          fullPath,
          JSON.stringify(
            mergedContent,
            null,
            2,
          ),
        );

        return true;
      } catch (err) {
        debug(`Error updating config file at ${path}`, err);
        return false;
      }
    },
  };
}

export function removeDir(path: string): TAction<'remove-dir'> {
  const folderPath = toFileUrl(path);
  return {
    type: 'remove-dir',
    description: `Remove folder at ${path}`,
    execute: async () => {
      try {
        await Deno.remove(folderPath, { recursive: true });
        return true;
      } catch (err) {
        debug(`Error removing folder at ${path}`, err);
        return false;
      }
    },
  };
}
