import { IDenoHerder } from '../../deno-herder.ts';

import { ModulesRunner } from './modules.ts';
import { ExternalRunner } from './external.ts';

export function registerRunners(sm: IDenoHerder) {
  const modulesRunner = new ModulesRunner(sm);
  const externalRunner = new ExternalRunner(sm);

  const store = sm.services.get('runners');
  store.setDefault(externalRunner);
  store.add(modulesRunner);
}
