const { parseArgv } = require('./cli');
const { getConfig, getStacks, getLabels, getStages, executeCommand } = require('./dmark');
const { cliConfig } = require('./cliConfig');

function main() {
  const { cmd, flags, options, rest } = parseArgv(cliConfig);

  const config = getConfig(options?.config);
  const stacks = getStacks(config, options?.stack);
  const stages = getStages(config, options?.stage);
  const labels = getLabels(options?.label);

  executeCommand(cmd, config, {
    stacks,
    stages,
    labels,
    fmt: flags?.fmt,
    initUpgrade: flags?.upgrade,
    initMigrateState: flags['migrate-state'],
    autoApprove: flags['auto-approve'],
    noInit: flags['no-init'],
    rest,
  });
}

main();
