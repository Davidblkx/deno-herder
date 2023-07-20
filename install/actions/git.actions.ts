import { fromFileUrl, toFileUrl } from '../deps.ts';
import { TAction } from '../models.ts';
import { debug, isFile } from '../utils.ts';

export function createGitClone(path: string, remote: string): TAction<'git-clone'> {
  const clonePath = fromFileUrl(toFileUrl(path));
  return {
    type: 'git-clone',
    description: `Clone git repository ${remote} at ${path}`,
    execute: async () => {
      try {
        const cmd = new Deno.Command('git', {
          args: ['clone', remote, clonePath],
        });

        const out = await cmd.output();
        if (!out.success) {
          const outText = new TextDecoder().decode(out.stdout);
          debug(`Error cloning git repository ${remote} at ${path}`, outText);
          return false;
        }

        return true;
      } catch (err) {
        debug(`Error cloning git repository ${remote} at ${path}`, err);
        return false;
      }
    },
  };
}

export function createGitInit(path: string): TAction<'git-init'> {
  const clonePath = fromFileUrl(toFileUrl(path));
  return {
    type: 'git-init',
    description: `Init git repository at ${path}`,
    execute: async () => {
      try {
        const cmd = new Deno.Command('git', {
          cwd: clonePath,
          args: ['init'],
        });

        const out = await cmd.output();
        if (!out.success) {
          const outText = new TextDecoder().decode(out.stdout);
          debug(`Error initializing git repository at ${path}`, outText);
          return false;
        }

        return true;
      } catch (err) {
        debug(`Error initializing git repository at ${path}`, err);
        return false;
      }
    },
  };
}

export function createSetGitRemote(path: string, remote: string): TAction<'git-remote'> {
  const clonePath = fromFileUrl(toFileUrl(path));
  return {
    type: 'git-remote',
    description: `Set git remote ${remote} at ${path}`,
    execute: async () => {
      try {
        const cmd = new Deno.Command('git', {
          cwd: clonePath,
          args: ['remote', 'set-url', 'origin', remote],
        });

        const out = await cmd.output();
        if (!out.success) {
          const outText = new TextDecoder().decode(out.stdout);
          debug(`Error setting git remote ${remote} at ${path}`, outText);
          return false;
        }

        return true;
      } catch (err) {
        debug(`Error setting git remote ${remote} at ${path}`, err);
        return false;
      }
    },
  };
}

export function createSetupSSH(
  {
    filePath,
    sshConfigName,
    sshConfigHost,
    sshConfigUser,
    sshConfigIdentityFile,
  }: {
    filePath: string;
    sshConfigName: string;
    sshConfigHost: string;
    sshConfigUser: string;
    sshConfigIdentityFile: string;
  },
): TAction<'setup-ssh'> {
  return {
    type: 'setup-ssh',
    description: `Setup ssh configuration`,
    execute: async () => {
      try {
        const configPath = toFileUrl(filePath);
        const config = await isFile(filePath) ? await Deno.readTextFile(configPath) : '';

        if (config.includes(`Host ${sshConfigName}`)) {
          debug(`SSH config already exists`);
          return true;
        }

        const newConfig = `
Host ${sshConfigName}
  HostName ${sshConfigHost}
  User ${sshConfigUser}
  IdentityFile ${sshConfigIdentityFile}
`;

        await Deno.writeTextFile(configPath, config + newConfig);

        return true;
      } catch (err) {
        debug(`Error setting up ssh config`, err);
        return false;
      }
    },
  };
}
