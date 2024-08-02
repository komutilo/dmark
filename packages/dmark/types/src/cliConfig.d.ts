export namespace cliConfig {
    const validFlags: ({
        name: string;
        description: string;
        shortCut?: undefined;
    } | {
        name: string;
        shortCut: string;
        description: string;
    })[];
    const validOptions: ({
        name: string;
        shortCut: string;
        description: string;
    } | {
        name: string;
        description: string;
        shortCut?: undefined;
    })[];
}
//# sourceMappingURL=cliConfig.d.ts.map