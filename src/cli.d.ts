export type FlagOptions = {
    shortCut: string;
}

export function checkFlag(flagName: string, opts: FlagOptions): boolean;
export function getArgValues(argVariants: string[] | string): string[];
export function getCommand(): string;
export function showHelp(): void;
