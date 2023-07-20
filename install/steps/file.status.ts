import { IStep } from '../models.ts';
import {
  C,
  getScriptsConfigPath,
  getScriptsFolderPath,
  isDirectory,
  isFile,
  machineConfigIsFile,
  scriptFolderExists,
} from '../utils.ts';
import { Select } from '../deps.ts';

export const checkFileSystem: IStep = {
  description: 'Checking configuration',
  execute: async (s) => {
    const hasFile = await machineConfigIsFile(s);
    const hasFolder = await scriptFolderExists(s);
    const hasFolderFile = await isFile(getScriptsConfigPath(s));

    s.a.createFolder = !hasFolder;
    s.a.createMachineConfigFile = !hasFile;
    s.a.createScriptConfigFile = !hasFolderFile;
    s.a.updateMachineConfigFile = hasFile;
    s.a.updateScriptConfigFile = hasFolderFile;
  },
};

export const checkGitRepo: IStep = {
  description: 'Checking current scripts folder',
  use: (s) => !s.a.createFolder && !s.p.disableGit,
  execute: async (s) => {
    const gitFolder = `${getScriptsFolderPath(s)}/.git`;
    const workdir = getScriptsFolderPath(s);

    const isDir = await isDirectory(workdir);
    const isGit = await isDirectory(gitFolder);

    if (!isDir || !isGit) {
      s.a.initGit = true;
      return;
    }

    const getGitRepo = new Deno.Command('git', {
      args: ['remote', 'get-url', 'origin'],
      cwd: workdir,
    });

    const output = await getGitRepo.output();
    if (!output.success || !output.stdout || !output.stdout.length) {
      // TODO: handle error
      if (!s.t.interactive) {
        throw new Error(
          'Git repository is not valid. Remove scripts folder and try again.',
        );
      }

      const errRes = await Select.prompt({
        message: C('red', 'Error checking git repository. What do you want todo?'),
        options: [{
          name: 'Reset git repository',
          value: 'reset',
        }, {
          name: 'Clone git repository',
          value: 'clone',
        }, {
          name: 'Abort',
          value: 'abort',
        }],
      }) as unknown as 'reset' | 'clone' | 'abort';
      if (errRes === 'abort') Deno.exit(1);
      if (errRes === 'reset') {
        s.a.initGit = true;
        s.a.updateScriptConfigFile = false;
        s.a.createScriptConfigFile = true;
        s.a.createDenoFile = true;
        return;
      }
      if (errRes === 'clone') {
        s.a.cloneRemote = true;
        s.a.updateScriptConfigFile = true;
        s.a.createScriptConfigFile = false;
        s.a.updateDenoFile = true;
        return;
      }
      return;
    }

    const gitRemote = new TextDecoder().decode(output.stdout).trim();
    console.log('Git remote:', gitRemote);
    s.p.gitRemote = gitRemote;
    return;
  },
};
