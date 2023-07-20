import { getLogger, Logger, loggerHandlers, loggerSetup } from './deps.ts';

// deno-lint-ignore no-explicit-any
export type GenericFunction = (...args: any[]) => any;

let logger: Logger | undefined;

function setupLogger() {
  loggerSetup({
    handlers: {
      console: new loggerHandlers.ConsoleHandler('DEBUG'),
    },
    loggers: {
      'deno-herder': {
        level: 'DEBUG',
        handlers: ['console'],
      },
    },
  });
}

export function enableLogger() {
  setupLogger();
  logger = getLogger('deno-herder');
}

export function debug<T>(msg: T extends GenericFunction ? never : T, ...args: unknown[]) {
  logger?.debug(msg, ...args);
}
