import { IStep, State } from '../models.ts';
import { requestInput } from '../utils.ts';
import { Confirm, join, Select } from '../deps.ts';

function getHomeFolder() {
  return Deno.env.get('HOME') ||
    Deno.env.get('USERPROFILE') ||
    Deno.env.get('HOMEPATH') ||
    Deno.env.get('HOMEDRIVE') || '~';
}

export const requestHomeFolder: IStep = {
  description: 'Request home folder',
  use: (s) => s.p.homeFolder === '_' || !s.p.homeFolder,
  async execute(s: State) {
    s.p.homeFolder = await requestInput({
      message: 'Home folder:',
      flag: '--home',
      defaultValue: getHomeFolder(),
      hint: 'This is the folder where deno-herder will create a folder for your scripts.',
    });
  },
};

export const requestConfigFileName: IStep = {
  description: 'Request config name',
  use: (s) => s.p.configFileName === '_' || !s.p.configFileName,
  async execute(s: State) {
    s.p.configFileName = await requestInput({
      message: 'Config file name:',
      flag: '--config-name',
      defaultValue: '.deno-herder.ts',
      hint:
        'This is the name of the file that deno-herder will look for to load configuration.',
    });
  },
};

export const requestScriptsFolder: IStep = {
  description: 'Request scripts folder',
  use: (s) => s.p.scriptsFolder === '_' || !s.p.scriptsFolder,
  async execute(s: State) {
    s.p.scriptsFolder = await requestInput({
      message: 'Scripts folder:',
      flag: '--dir-name',
      defaultValue: '.scripts',
      hint: 'This is the folder name where deno-herder will look for your scripts.',
    });
  },
};

export const requestGitRepo: IStep = {
  description: 'Checking git repo',
  use: (s) => !s.p.disableGit,
  execute: async (s) => {
    if (!s.p.gitRemote) {
      s.p.gitRemote = await requestInput({
        message: 'Git repository:',
        flag: '--git-repo',
        hint: 'This is the git repository where deno-herder will push your scripts.',
      });
    }

    if (!s.a.cloneRemote && !s.a.initGit && s.p.gitRemote && s.a.createFolder) {
      if (!s.t.interactive) {
        throw new Error(
          'Git repository is not valid. Flag --git-init or --git-clone is required.',
        );
      }

      const action = await Select.prompt({
        message: 'How should we handle the git repository?',
        options: [
          { name: 'Clone repository', value: 'clone' },
          { name: 'Create new repo', value: 'init' },
          { name: 'Just set the remote', value: 'skip' },
        ],
      }) as unknown as 'clone' | 'init' | 'skip';

      s.a.cloneRemote = action === 'clone';
      s.a.initGit = action === 'init';
    }
  },
};

export const requestSshConfig: IStep = {
  description: 'Checking ssh config',
  use: (s) => !s.p.disableGit && !!s.p.gitRemote && !s.p.sshConfigName && s.t.interactive,
  async execute(s) {
    const useSsh = await Confirm.prompt({
      message: 'Do you want to use a specific ssh config?',
      default: false,
    });

    if (!useSsh) {
      return;
    }

    s.a.setupSsh = true;
    s.p.sshConfigFile = s.p.sshConfigFile ?? 'config';
    s.p.sshConfigName = await requestInput({
      message: 'SSH config name:',
      flag: '--ssh-config-name',
      hint:
        'This is the name of the ssh config that will be used to connect to the git repository.',
      minLength: 3,
      defaultValue: 'personal',
    });
  },
};

export const requestSshUser: IStep = {
  description: 'Request SSH user',
  use: (s) => !!s.p.sshConfigName && !s.p.sshConfigUser,
  async execute(s) {
    s.p.sshConfigUser = await requestInput({
      message: 'SSH config user:',
      flag: '--ssh-config-user',
      hint: 'This is the user that will be used to connect to the git repository.',
      minLength: 1,
      defaultValue: 'git',
    });
  },
};

export const requestSshDomain: IStep = {
  description: 'Request SSH host',
  use: (s) => !!s.p.sshConfigName && !s.p.sshConfigHost,
  async execute(s) {
    // Extract domain from git remote
    const domain = s.p.gitRemote?.match(/@([^:]+):/) || [];
    if (domain.length > 1) {
      s.p.sshConfigHost = domain[1];
    }

    s.p.sshConfigHost = await requestInput({
      message: 'SSH config host:',
      flag: '--ssh-config-host',
      hint: 'This is the host that will be used to connect to the git repository.',
      minLength: 1,
      defaultValue: s.p.sshConfigHost || 'github.com',
    });
  },
};

export const requestSshIdentityFile: IStep = {
  description: 'Request SSH identity file',
  use: (s) => !!s.p.sshConfigName && !s.p.sshConfigIdentityFile,
  async execute(s) {
    s.p.sshConfigIdentityFile = await requestInput({
      message: 'SSH config identity file:',
      flag: '--ssh-config-identity-file',
      hint:
        'This is the identity file that will be used to connect to the git repository.',
      minLength: 1,
      defaultValue: 'id_ed25519_personal',
    });
  },
};

export const requestSshFolder: IStep = {
  description: 'Request SSH folder',
  use: (s) => !!s.p.sshConfigName && !s.p.sshFolder,
  async execute(s) {
    s.p.sshFolder = await requestInput({
      message: 'SSH folder:',
      flag: '--ssh-folder',
      hint: 'This is the folder where the ssh config file will be created.',
      minLength: 1,
      defaultValue: join(getHomeFolder(), '.ssh'),
    });
  },
};
