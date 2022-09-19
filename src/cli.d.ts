export type FlagOptions = {
    shortCut: string;
    default: true;
}

export function checkFlag(flagName: string, opts: FlagOptions): boolean;
export function getArgValue(argName: string, shortCut: string): string | null;
export function getCommand(): string;
export function showHelp(): void;
