import { configParamMapKey, IStep, ParamsOptions, State } from '../models.ts';
import { Confirm, join, toFileUrl } from '../deps.ts';
import { debug } from '../logger.ts';

export const loadArgConfig: IStep = {
  description: 'Loading configuration file',
  use: (s) => !!s.t.config,
  target: (s) => s.t.config ?? '',
  execute: async (s) => {
    await loadEnvConfig(s, s.t.config!);
  },
};

export const confirmReloadExistingConfig: IStep = {
  description: 'Confirm reload existing config',
  target: (s) => getMachineConfigPath(s),
  use: async (s) => {
    if (typeof s.t.loadExistingConfig === 'boolean') return false;
    return await machineConfigIsFile(s);
  },
  execute: async (s) => {
    s.t.loadExistingConfig = await Confirm.prompt({
      message: 'Do you want to reload the existing config?',
      hint: 'Will load install configuration from: ' + getMachineConfigPath(s),
    });
  },
};

export const reloadExistingConfig: IStep = {
  description: 'Reload existing config',
  use: async (s) => {
    if (!s.t.loadExistingConfig) return false;
    return await machineConfigIsFile(s);
  },
  target: (s) => getMachineConfigPath(s),
  execute: async (s) => {
    await loadEnvConfig(s, getMachineConfigPath(s));
  },
};

function getMachineConfigPath(s: State) {
  return join(s.p.homeFolder, s.p.configFileName);
}

async function machineConfigIsFile(s: State) {
  const fullPath = toFileUrl(getMachineConfigPath(s));
  try {
    const stat = await Deno.stat(fullPath);
    return stat.isFile;
  } catch (err) {
    debug('Error checking config file', err);
    return false;
  }
}

async function loadEnvConfig(s: State, path: string) {
  const config = await Deno.readTextFile(toFileUrl(path));
  const json = JSON.parse(config);

  for (
    const key of Object.keys(configParamMapKey) as (keyof ParamsOptions)[]
  ) {
    const currentValue = s.p[key];
    // Only override if the current value is the default value
    if (typeof currentValue === 'string' && currentValue !== '_') continue;
    // Only override if the current value is false
    if (typeof currentValue === 'boolean' && currentValue) continue;

    const jsonKey = configParamMapKey[key];
    if (!jsonKey) throw new Error(`Invalid config key: ${key}`);

    const jsonValue = json[jsonKey];

    if (jsonValue === undefined) continue;
    if (
      (typeof jsonValue === 'boolean' && typeof currentValue === 'boolean') ||
      (typeof jsonValue === 'string' && typeof currentValue === 'string')
    ) {
      s.p = {
        ...s.p,
        [key]: jsonValue,
      };
      continue;
    }
  }
}
