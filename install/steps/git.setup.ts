import { IStep } from '../models.ts';
import { createFolder, removeDir } from '../actions/mod.ts';
import { getScriptsFolderPath, isDirectory } from '../utils.ts';
import {
  createGitClone,
  createGitInit,
  createSetGitRemote,
  createSetupSSH,
} from '../actions/git.actions.ts';
import { join } from '../deps.ts';

export const setupGitClone: IStep = {
  description: 'Setup git clone',
  use: (s) => s.a.cloneRemote && !!s.p.gitRemote,
  execute: async (s) => {
    const path = getScriptsFolderPath(s);
    const remote = s.p.gitRemote ?? '[null]';

    if (await isDirectory(path)) {
      s.actions.push(removeDir(path));
    }

    s.actions.push(createGitClone(path, remote));
  },
};

export const setupGitInit: IStep = {
  description: 'Setup git init',
  use: (s) => s.a.initGit,
  execute: async (s) => {
    const path = getScriptsFolderPath(s);
    const gitPath = join(path, '.git');

    if (await isDirectory(gitPath)) {
      s.actions.push(removeDir(gitPath));
    }

    s.actions.push(createGitInit(path));

    if (s.p.gitRemote) {
      s.actions.push(createSetGitRemote(path, s.p.gitRemote));
    }
  },
};

export const setupSSHConfig: IStep = {
  description: 'Setup ssh config',
  use: (s) =>
    s.a.setupSsh && !!s.p.sshFolder && !!s.p.sshConfigFile && !!s.p.sshConfigName &&
    !!s.p.sshConfigHost && !!s.p.sshConfigUser && !!s.p.sshConfigIdentityFile,
  execute: async (s) => {
    const path = s.p.sshFolder ?? '[null]';
    const configFile = join(path, s.p.sshConfigFile ?? '[null]');
    const configName = s.p.sshConfigName ?? '[null]';
    const configHost = s.p.sshConfigHost ?? '[null]';
    const configUser = s.p.sshConfigUser ?? '[null]';
    const identityFile = s.p.sshConfigIdentityFile ?? '[null]';

    s.p.gitRemote = s.p.gitRemote?.replace(/(.*)@(.*):(.*)/g, `$1@${configName}:$3`);

    if (!await isDirectory(path)) {
      s.actions.push(createFolder(path));
    }

    s.actions.push(createSetupSSH({
      filePath: configFile,
      sshConfigHost: configHost,
      sshConfigIdentityFile: identityFile,
      sshConfigName: configName,
      sshConfigUser: configUser,
    }));
  },
};
