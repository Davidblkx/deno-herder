import { Input } from 'https://deno.land/x/cliffy@v1.0.0-rc.1/prompt/mod.ts';
import { isInteractive, opt } from './options.ts';

export async function loadFileSettings() {
  if (!isInteractive()) {
    return;
  }

  opt.userFolder = getHomeFolder();
  await loadRootFolder();
  await loadSettingFileName();
  await loadFolderName();
}

async function loadSettingFileName() {
  const fileNameValue = Deno.args.find((a) => a.startsWith('--file-name='));
  if (fileNameValue && fileNameValue.split('=')[1]) {
    opt.fileName = fileNameValue.split('=')[1];
    return;
  }

  opt.fileName = await Input.prompt({
    message: 'Enter file name for deno-herder settings:',
    default: '.deno-herder.json',
    hint: 'This is the file name that contains configuration for deno-herder.',
  });
}

function getHomeFolder() {
  return Deno.env.get('HOME') ||
    Deno.env.get('USERPROFILE') ||
    Deno.env.get('HOMEPATH') ||
    Deno.env.get('HOMEDRIVE') || '~';
}

async function loadRootFolder() {
  const folderValue = Deno.args.find((a) => a.startsWith('--root='));
  if (folderValue && folderValue.split('=')[1]) {
    opt.rootFolder = folderValue.split('=')[1];
    return;
  }

  opt.rootFolder = await Input.prompt({
    message: 'Enter root folder for scripts:',
    default: getHomeFolder(),
    hint: 'This is the folder where deno-herder will create a folder for your scripts.',
  });
}

async function loadFolderName() {
  const folderValue = Deno.args.find((a) => a.startsWith('--folder='));
  if (folderValue && folderValue.split('=')[1]) {
    opt.folder = folderValue.split('=')[1];
    return;
  }

  opt.folder = await Input.prompt({
    message: 'Enter folder name for scripts:',
    default: '.scripts',
    hint: 'This is the folder where deno-herder will put your scripts.',
  });
}
