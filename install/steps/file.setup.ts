import { IStep } from '../models.ts';
import {
  createConfigFile,
  createDenoFile,
  createFolder,
  updateConfigFile,
} from '../actions/mod.ts';
import {
  getMachineConfigPath,
  getScriptsConfigPath,
  getScriptsFolderPath,
} from '../utils.ts';

export const setupCreateFolder: IStep = {
  use: (s) => s.a.createFolder,
  description: 'Setup new script folder',
  execute: (s) => {
    const scriptsFolder = getScriptsFolderPath(s);
    s.actions.push(createFolder(scriptsFolder));
    s.actions.push(createDenoFile(scriptsFolder));
  },
};

export const setupMachineConfigFile: IStep = {
  use: (s) => s.a.createMachineConfigFile,
  description: 'Setup machine config file',
  execute: (s) => {
    const machineConfigPath = getMachineConfigPath(s);
    const scriptFolder = getScriptsFolderPath(s);
    s.actions.push(createConfigFile(machineConfigPath, {
      injectConfig: true,
      extraContent: {
        'core.root': scriptFolder,
      },
    }));
  },
};

export const setupScriptConfigFile: IStep = {
  use: (s) => s.a.createScriptConfigFile,
  description: 'Setup script config file',
  execute: (s) => {
    const scriptConfigPath = getScriptsConfigPath(s);
    s.actions.push(createConfigFile(scriptConfigPath));
  },
};

export const setupUpdateMachineConfigFile: IStep = {
  use: (s) => s.a.updateMachineConfigFile,
  description: 'Setup update machine config file',
  execute: (s) => {
    const machineConfigPath = getMachineConfigPath(s);
    const scriptFolder = getScriptsFolderPath(s);
    s.actions.push(updateConfigFile(machineConfigPath, {
      injectConfig: true,
      extraContent: {
        'core.root': scriptFolder,
      },
    }));
  },
};

export const setupUpdateScriptConfigFile: IStep = {
  use: (s) => s.a.updateScriptConfigFile,
  description: 'Setup update script config file',
  execute: (s) => {
    const scriptConfigPath = getScriptsConfigPath(s);
    s.actions.push(updateConfigFile(scriptConfigPath));
  },
};
