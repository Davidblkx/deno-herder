import { opt } from './options.ts';
import { requestInput } from './utils.ts';

export async function loadDomainSettings() {
  opt.cliName = await requestInput({
    message: 'Enter name for deno-herder cli:',
    defaultValue: 'deno-herder',
    hint: 'This is the name of the cli that you will use to call deno-herder',
    flag: '--cli-name',
  });

  opt.xCliName = await requestInput({
    message: 'Enter name for executor cli:',
    defaultValue: 'dhx',
    hint: 'This is the name of the cli that you will use to execute scripts',
    flag: '--x-cli-name',
  });
}
