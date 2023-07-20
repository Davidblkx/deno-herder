export type TerminalOptions = {
  interactive: boolean;
  useColors: boolean;
  useEmojis: boolean;
  ignoreLastInstall: boolean;
  force: boolean;
  config?: string;
  loadExistingConfig?: boolean;
  verbose: boolean;
};

export type ParamsOptions = {
  cliName: string;
  xCliName?: string;
  homeFolder: string;
  scriptsFolder: string;
  configFileName: string;
  disableGit: boolean;
  gitRemote?: string;
  sshFolder?: string;
  sshConfigFile?: string;
  sshConfigName?: string;
  sshConfigHost?: string;
  sshConfigUser?: string;
  sshConfigIdentityFile?: string;
};

export type ActionsOptions = {
  installExecutor: boolean;
  createFolder: boolean;
  createMachineConfigFile: boolean;
  createScriptConfigFile: boolean;
  createDenoFile: boolean;
  updateMachineConfigFile: boolean;
  updateScriptConfigFile: boolean;
  updateDenoFile: boolean;
  initGit: boolean;
  setRemote: boolean;
  cloneRemote: boolean;
  setupSsh: boolean;
};

export type State = {
  t: TerminalOptions;
  p: ParamsOptions;
  a: ActionsOptions;
  actions: IAction[];
};

export interface IStep {
  description: string;
  execute: (state: State) => Promise<State | void> | State | void;
  use?: ((state: State) => Promise<boolean> | boolean) | boolean;
  target?: string | ((state: State) => Promise<string> | string);
}

export interface IActionResult {
  success: boolean;
  output?: string;
}

export interface IAction {
  description: string;
  type: string;
  continueOnError?: boolean;
  execute: (state: State) => Promise<IActionResult | boolean> | IActionResult | boolean;
}

export type TAction<T extends string> = IAction & { type: T };

export type InstallSteps = {
  /** Run system validations */
  validations: IStep[];
  /** Collect user input */
  collector: IStep[];
  /** Setup required actions to install */
  setup: IStep[];
  /** Run install actions */
  install: IStep[];
};

export const state: State = {
  t: {
    interactive: true,
    useColors: true,
    useEmojis: true,
    force: false,
    ignoreLastInstall: false,
    verbose: false,
  },
  p: {
    cliName: '_',
    configFileName: '_',
    homeFolder: '_',
    disableGit: false,
    scriptsFolder: '_',
  },
  a: {
    cloneRemote: false,
    createFolder: false,
    createMachineConfigFile: false,
    createScriptConfigFile: false,
    createDenoFile: false,
    initGit: false,
    installExecutor: false,
    setRemote: false,
    setupSsh: false,
    updateMachineConfigFile: false,
    updateScriptConfigFile: false,
    updateDenoFile: false,
  },
  actions: [],
};

export const configParamMapKey: { [key in keyof ParamsOptions]: string } = {
  cliName: 'install.cli-name',
  xCliName: 'install.x-cli-name',
  configFileName: 'install.config-file-name',
  disableGit: 'install.disable-git',
  homeFolder: 'install.home-folder',
  scriptsFolder: 'install.scripts-folder',
  gitRemote: 'install.git-remote',
  sshConfigFile: 'install.ssh-config-file',
  sshConfigHost: 'install.ssh-config-host',
  sshConfigIdentityFile: 'install.ssh-config-identity-file',
  sshConfigName: 'install.ssh-config-name',
  sshConfigUser: 'install.ssh-config-user',
  sshFolder: 'install.ssh-folder',
};
