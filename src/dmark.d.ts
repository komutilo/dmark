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
    upgrade: boolean,
    fmt: boolean,
    migrateState: boolean,
    autoApprove: boolean,
}

export function getConfig(): DmarkConfig;
export function getStacks(config: DmarkConfig): string[];
export function getStages(config: DmarkConfig): string[];
export function getLabels(config: DmarkConfig): string[];
export function executeCommand(cmd: string, config: DmarkConfig, opts: DmarkOptions): void;
