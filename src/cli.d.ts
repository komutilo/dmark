export type FlagInput = {
    name: string[] | string;
    shortCut?: string[] | string;
    description?: string;
}

export type OptionInput = {
    name: string[] | string;
    shortCut?: string[] | string;
    description?: string;
}

export type Flags = {
    [key: string]: boolean;
}

export type Options = {
    [key: string]: unknown;
}

export type Cli = {
    cmd: string;
    flags: Flags;
    options: Options;
    rest: string[];
    showHelp: () => string;
}

export function parseArgv(validFlags?: FlagInput[], validOptions?: OptionInput[]): Cli;