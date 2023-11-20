import * as kolorist from 'kolorist';

export default {
    warn: (message: string) => {
        console.warn(kolorist.yellow(message));
    },
    error: (message: string) => {
        console.error(kolorist.red(message));
    },
    info: (message: string) => {
        console.info(kolorist.reset(message));
    },
    verbose: (message: string) => {
        // eslint-disable-next-line no-console
        console.debug(kolorist.dim(message));
    },
};
