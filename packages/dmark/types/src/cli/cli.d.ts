export type FlagInput = {
    name: string[] | string;
    shortCut: string[] | string | undefined;
    description: string | undefined;
};
export type OptionInput = {
    name: string[] | string;
    shortCut: string[] | string | undefined;
    description: string | undefined;
};
export type CliConfig = {
    validFlags: FlagInput[] | undefined;
    validOptions: OptionInput[] | undefined;
};
export type Cli = {
    cmd: string;
    flags: {
        [x: string]: boolean;
    };
    options: {
        [x: string]: unknown;
    };
    rest: string[];
};
/**
 * Parse process.argv values using a cli config for arguments validation.
 *
 * @param {CliConfig} config The config for args validation.
 * @returns {Cli} The parsed Cli object.
 * @throws {InvalidFirstArgumentError} If the first argument is not a command.
 */
export function parseArgv(config: CliConfig): Cli;
//# sourceMappingURL=cli.d.ts.map