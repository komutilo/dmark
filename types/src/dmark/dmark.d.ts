export type LocalConfig = {
    path: string;
};
export type StageConfig = {
    vars: {
        [x: string]: string;
    } | undefined;
    backendConfig: {
        [x: string]: string;
    } | undefined;
};
export type GlobalStackConfig = {
    local: LocalConfig | boolean | undefined;
    stages: {
        [x: string]: StageConfig;
    } | undefined;
    labels: string[] | undefined;
};
export type StackConfig = GlobalStackConfig;
export type DmarkConfig = {
    globals: GlobalStackConfig | undefined;
    stacks: {
        [x: string]: StackConfig;
    };
};
export type DmarkOptions = {
    stacks: string[];
    stages: string[];
    labels: string[];
    fmt: boolean;
    initUpgrade: boolean;
    initMigrateState: boolean;
    autoApprove: boolean;
    noInit: boolean;
    rest: string[];
};
/**
 * Return the config object from a config file in the target project.
 * Default path is: ./dmark.config.yaml
 *
 * @param {string | undefined} configPath The custom config path.
 * @returns {DmarkConfig} The config loaded object.
 * @throws {InvalidConfigFileError} If a config file is not found.
 */
export function getConfig(configPath: string | undefined): DmarkConfig;
/**
 * Get input labels to filter or return none.
 *
 * @param {string[] | undefined} labels The input labels.
 * @returns {string[]} Input labels or no one.
 */
export function getLabels(labels: string[] | undefined): string[];
/**
 * Get stack names to execute command on.
 * Return all stack names if no one is provided.
 *
 * @param {DmarkConfig} config The config object.
 * @param {string[] | undefined} stacks The stacks input.
 * @returns {string[]} The stacks names.
 * @throws {NoConfigProvidedError} if no config was provided.
 * @throws {InvalidStackNameError} if a provided stack name from input is not compatible with the ones in the config.
 */
export function getStacks(config: DmarkConfig, stacks: string[] | undefined): string[];
/**
 * Get stage names to execute command on.
 * Return all stage names if no one is provided.
 *
 * @param {DmarkConfig} config The config object.
 * @param {string[] | undefined} stages The stages input.
 * @returns {string[]} The stages names.
 * @throws {NoConfigProvidedError} if no config was provided.
 * @throws {InvalidStageNameError} if a provided stage name from input is not compatible with the ones in the config.
 */
export function getStages(config: DmarkConfig, stages: string[] | undefined): string[];
/**
 * Execute a terraform command.
 *
 * @param {string} cmd The command to execute.
 * @param {DmarkConfig} config The config object.
 * @param {DmarkOptions} opts The options.
 */
export function executeCommand(cmd: string, config: DmarkConfig, opts: DmarkOptions): Promise<void>;
//# sourceMappingURL=dmark.d.ts.map