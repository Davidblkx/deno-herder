import { IStep, ParamsOptions, state, TerminalOptions } from './models.ts';
import { steps } from './steps/mod.ts';
import { C, E, saveTtyPosition } from './utils.ts';
import { tty } from './deps.ts';
import { enableLogger } from './logger.ts';

export async function install(
  t: Partial<TerminalOptions>,
  p: Partial<ParamsOptions>,
): Promise<void> {
  state.t = {
    ...state.t,
    ...t,
    // verbose: true,
  };

  state.p = {
    ...state.p,
    ...p,
  };

  if (state.t.verbose) {
    enableLogger();
  }

  tty.text(
    C('green', `${E('🐉 ')}Welcome to deno-herder installer!${E(' 🐉')}\n\n`),
  );

  if (steps.validations.length > 0) {
    tty.text(`${E('🩺', '>')} ${C('magenta', 'System validation:')}\n`);
    for (const step of steps.validations) {
      const { restore } = saveTtyPosition();
      if (!(await checkUseStep(step))) continue;
      tty.text(`  ${C('cyan', step.description)}...\n`);
      await step.execute(state);
      restore();
      tty.text(`  ${C('cyan', step.description)}... ${E('✅', C('green', 'OK!'))}\n`);
    }
    tty.text(` ${C('magenta', '---------------------')} \n\n`);
  }

  if (steps.collector.length > 0) {
    tty.text(`${E('⚙', '>')} ${C('magenta', 'Config Validation:')}\n`);
    for (const step of steps.collector) {
      const { restore } = saveTtyPosition();
      if (!(await checkUseStep(step))) continue;
      tty.text(`  ${C('cyan', step.description)}...\n`);
      await step.execute(state);
      restore();
      tty.text(`  ${C('cyan', step.description)}... ${E('✅', C('green', 'OK!'))}\n`);
    }
    tty.text(` ${C('magenta', '---------------------')} \n\n`);
  }

  if (steps.setup.length > 0) {
    tty.text(`${E('🔧', '>')} ${C('magenta', 'Setup install steps:')}\n`);
    for (const step of steps.setup) {
      const { restore } = saveTtyPosition();
      if (!(await checkUseStep(step))) continue;
      tty.text(`  ${C('cyan', step.description)}...\n`);
      await step.execute(state);
      restore();
      tty.text(`  ${C('cyan', step.description)}... ${E('✅', C('green', 'OK!'))}\n`);
    }
    tty.text(` ${C('magenta', '---------------------')} \n\n`);
  }

  if (steps.install.length > 0) {
    tty.text(`${E('🚀', '>')} ${C('magenta', 'Install steps:')}\n`);
    for (const step of steps.install) {
      const { restore } = saveTtyPosition();
      if (!(await checkUseStep(step))) continue;
      tty.text(`  ${C('cyan', step.description)}...\n`);
      await step.execute(state);
      restore();
      tty.text(`  ${C('cyan', step.description)}... ${E('✅', C('green', 'OK!'))}\n`);
    }
    tty.text(` ${C('magenta', '---------------------')} \n\n`);
  }
}

async function checkUseStep(step: IStep): Promise<boolean> {
  if (typeof step.use === 'function') return await step.use(state);
  if (typeof step.use === 'boolean') return step.use;
  return true;
}
