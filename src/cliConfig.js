const cliConfig = {
    validFlags: [
        {
            name: 'fmt',
            description: 'Run "terraform fmt" before running the command',
        },
        {
            name: 'upgrade',
            shortCut: 'u',
            description: 'add the terraform option "-upgrade" to the "terraform init" run',
        },
        {
            name: 'migrate-state',
            shortCut: 'migrate-state',
            description: 'add the terraform option "-migrate-state" to the "terraform init" run',
        },
        {
            name: 'auto-approve',
            shortCut: 'auto-approve',
            description: 'cancel the input asking for approval in the terraform commands',
        },
        {
            name: 'no-init',
            description: 'all commands run the init first for setup the backend-config parameters, if for some reason this is not necessary add this flag',
        },
    ],
    validOptions: [
        {
            name: 'config',
            shortCut: 'c',
            description: 'The path of the config file, the default is "./dmark.config.yaml"',
        },
        {
            name: 'stage',
            description: 'The stages to run the command, could have multiples in one call',
        },
        {
            name: 'stack',
            description: 'The stacks to run the command, could have multiples in one call',
        },
        {
            name: 'label',
            shortCut: 'l',
            description: 'The stack labels to filter in a call',
        },
    ],
};

module.exports = { cliConfig };
