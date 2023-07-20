import { InstallSteps } from '../models.ts';

import { validatePermissions } from './validate-permissions.ts';
import { validateGIT } from './validate-git.ts';

import {
  confirmReloadExistingConfig,
  loadArgConfig,
  reloadExistingConfig,
} from './load-config.ts';
import {
  requestConfigFileName,
  requestGitRepo,
  requestHomeFolder,
  requestScriptsFolder,
  requestSshConfig,
  requestSshDomain,
  requestSshFolder,
  requestSshIdentityFile,
  requestSshUser,
} from './load-input.ts';
import { checkFileSystem, checkGitRepo } from './file.status.ts';

import {
  setupCreateFolder,
  setupMachineConfigFile,
  setupScriptConfigFile,
  setupUpdateMachineConfigFile,
  setupUpdateScriptConfigFile,
} from './file.setup.ts';

import { setupGitClone, setupGitInit, setupSSHConfig } from './git.setup.ts';

import { confirmInstallSteps } from './confirm.install.ts';

export const steps: InstallSteps = {
  validations: [
    validatePermissions,
    validateGIT,
  ],
  collector: [
    loadArgConfig,
    requestHomeFolder,
    requestConfigFileName,
    confirmReloadExistingConfig,
    reloadExistingConfig,
    requestScriptsFolder,
    checkFileSystem,
    checkGitRepo,
    requestGitRepo,
    requestSshConfig,
    requestSshUser,
    requestSshDomain,
    requestSshIdentityFile,
    requestSshFolder,
  ],
  setup: [
    setupSSHConfig,
    setupCreateFolder,
    setupGitClone,
    setupGitInit,
    setupMachineConfigFile,
    setupScriptConfigFile,
    setupUpdateMachineConfigFile,
    setupUpdateScriptConfigFile,
  ],
  install: [
    confirmInstallSteps,
  ],
};
