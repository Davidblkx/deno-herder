import { IStep } from '../models.ts';
import { Confirm, tty } from '../deps.ts';
import { C } from '../utils.ts';

export const confirmInstallSteps: IStep = {
  description: 'Confirm install',
  use: (s) => s.t.interactive,
  execute: async (s) => {
    tty.text(C('yellow', 'Install steps:\n'));
    for (const action of s.actions) {
      tty.text(`  ${C('green', '>')} ${C('blue', action.description)}\n`);
    }

    const confirm = await Confirm.prompt({
      message: 'Do you want to continue?',
      default: true,
    });

    if (!confirm) {
      Deno.exit(0);
    }
  },
};
