export class InvalidCliArgumentError extends Error {
    constructor(name: any);
}
export class InvalidFirstArgumentError extends Error {
    constructor();
}
export class InvalidSchemaError extends Error {
    constructor(schemaErrors: any, schemaName?: string);
}
export class InvalidConfigFileError extends Error {
    constructor(configPath: any);
}
export class NoConfigProvidedError extends Error {
    constructor(functionName: any);
}
export class InvalidStackNameError extends Error {
    constructor(stackName: any);
}
export class InvalidStageNameError extends Error {
    constructor(stageName: any);
}
export class MissingStackPathError extends Error {
    constructor(stackName: any);
}
export class InvalidStackPathError extends Error {
    constructor(stackPath: any);
}
export class MissingStageNameError extends Error {
    constructor();
}
//# sourceMappingURL=errors.d.ts.map