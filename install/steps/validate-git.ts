import { tty } from '../deps.ts';
import { IStep } from '../models.ts';

export const validateGIT: IStep = {
  description: 'Checking GIT version',
  use: (s) => !s.p.disableGit,
  execute: async () => {
    const cmd = new Deno.Command('git', {
      args: ['--version'],
    });
    const out = await cmd.output();
    const version = new TextDecoder().decode(out.stdout);
    if (!version.startsWith('git version')) throw new Error('GIT is not installed!');
    tty.text('GIT version: ' + version);
  },
};
