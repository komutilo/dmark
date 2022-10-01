export type StagesConfig = {
    [key: string]: {
        vars?: { [key: string]: string },
        backendConfig?: { [key: string]: string },
    }
}

export type LocalConfig = {
    path: string,
} | boolean

export type GlobalStackConfig = {
    local?: LocalConfig,
    stages?: StagesConfig,
    labels?: string[],
}

export type StackConfig = GlobalStackConfig & {
    path: string,
    description?: string,
    order?: number,
}

export type DmarkConfig = {
    globals?: GlobalStackConfig,
    stacks: {
        [key: string]: StackConfig,
    }
}

export type DmarkOptions = {
    stacks: string[],
    stages: string[],
    labels: string[],
    fmt: boolean,
    initUpgrade: boolean,
    initMigrateState: boolean,
    autoApprove: boolean,
    noInit: boolean,
    rest: string[],
}

export function getConfig(configPath?: string): DmarkConfig;
export function getStacks(config: DmarkConfig, stacks?: string[]): string[];
export function getStages(config: DmarkConfig, stages?: string[]): string[];
export function getLabels(labels?: string[]): string[];
export function executeCommand(cmd: string, config: DmarkConfig, opts: DmarkOptions): void;
