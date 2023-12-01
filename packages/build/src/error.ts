export enum ExitCode {
    ParseError = 2,
    WriteError = 3,
    Unknown = 9,
}

export class ExitError extends Error {
    constructor(readonly code: ExitCode) {
        super();
    }
}
