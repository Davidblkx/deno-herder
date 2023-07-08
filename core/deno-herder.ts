import type { Logger } from '../modules/logger/mod.ts';
import { IServices } from '../modules/services.ts';
import { APP_VERSION } from '../version.ts';

export interface IDenoHerder {
  readonly services: IServices;
  readonly root: URL;
  readonly version: string;
}

export class DenoHerder implements IDenoHerder {
  #services: IServices;
  #root: URL;
  #logger: Logger;

  get root(): URL {
    return this.#root;
  }

  get services(): IServices {
    return this.#services;
  }

  get version(): string {
    return APP_VERSION;
  }

  constructor(services: IServices, root: URL) {
    this.#services = services;
    this.#root = root;

    this.#logger = services.get('logger').get('deno-herder');
    this.#logger.debug('DenoHerder root at: ' + root.pathname);
  }
}

export type ModuleResult = string | number | boolean | void | {
  success: boolean;
  message?: string;
  data?: unknown;
};

export type DenoHerderModule = (
  args: string[],
  context: IDenoHerder,
) => ModuleResult | Promise<ModuleResult>;
