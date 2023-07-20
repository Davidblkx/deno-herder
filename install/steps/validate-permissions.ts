import { IStep } from '../models.ts';
import { C } from '../utils.ts';

export const validatePermissions: IStep = {
  description: 'Checking permissions',
  execute: async ({ t }) => {
    await ensurePermission(
      { name: 'env' },
      '--allow-env',
      'Requesting access to environment variables.',
      t.interactive,
    );
    await ensurePermission(
      { name: 'read' },
      '--allow-read',
      'Requesting access to read files.',
      t.interactive,
    );
    await ensurePermission(
      { name: 'write' },
      '--allow-write',
      'Requesting access to write files.',
      t.interactive,
    );
    await ensurePermission(
      { name: 'run' },
      '--allow-run',
      'Requesting access to run executables.',
      t.interactive,
    );
  },
};

async function ensurePermission(
  d: Deno.PermissionDescriptor,
  flag: string,
  reason: string,
  isInteractive: boolean,
) {
  const { state } = await Deno.permissions.query(d);
  if (state === 'granted') return;

  if (!isInteractive) {
    throw new Error(`${flag} flag is required in non-interactive mode!`);
  }

  console.log(C('yellow', reason));
  const { state: newState } = await Deno.permissions.request(d);
  if (newState === 'granted') return;

  throw new Error(`${d.name} permission is required! State: ${newState}`);
}
