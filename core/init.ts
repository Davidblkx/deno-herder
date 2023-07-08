import { services } from '../modules/services.ts';
import { DenoHerder, IDenoHerder } from './deno-herder.ts';
import { initialize, InitializeOptions, registerRunners } from './init/mod.ts';

export async function initDenoHerder(
  options: InitializeOptions = {},
): Promise<IDenoHerder> {
  services.registerDefaults();

  const root = await initialize(services, options);
  const sm = new DenoHerder(services, root);
  registerRunners(sm);

  return sm;
}
