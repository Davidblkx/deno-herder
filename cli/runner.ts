import { initDenoHerder } from '../core/init.ts';

const sm = await initDenoHerder();
console.log(sm.version);
