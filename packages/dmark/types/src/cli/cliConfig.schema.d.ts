export namespace cliConfigSchema {
    const validFlags: {
        name: {
            type: StringConstructor;
            required: boolean;
        };
        description: {
            type: StringConstructor;
        };
        shortCut: {
            type: StringConstructor;
        };
    }[];
    const validOptions: {
        name: {
            type: StringConstructor;
            required: boolean;
        };
        description: {
            type: StringConstructor;
        };
        shortCut: {
            type: StringConstructor;
        };
    }[];
}
//# sourceMappingURL=cliConfig.schema.d.ts.map