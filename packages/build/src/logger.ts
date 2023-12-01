import * as kolorist from 'kolorist';

export type LogLevel = 'verbose' | 'info' | 'warn' | 'error';

export const LOG_LEVELS: LogLevel[] = ['verbose', 'info', 'warn', 'error'];

interface LoggerOptions {
    level: LogLevel;
}

const options: LoggerOptions = {
    level: 'info',
};

function isLevelEnabled(level: LogLevel) {
    return LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(options.level);
}

export default {
    setLevel: (level: LogLevel) => {
        options.level = level;
    },
    warn: (message: string) => {
        if (isLevelEnabled('warn')) {
            console.warn(kolorist.yellow(message));
        }
    },
    error: (message: string) => {
        if (isLevelEnabled('error')) {
            console.error(kolorist.red(message));
        }
    },
    info: (message: string) => {
        if (isLevelEnabled('info')) {
            console.info(kolorist.reset(message));
        }
    },
    verbose: (message: string) => {
        if (isLevelEnabled('verbose')) {
            // eslint-disable-next-line no-console
            console.debug(kolorist.dim(message));
        }
    },
};
