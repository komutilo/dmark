const { checkFlag, getCommand, showHelp } = require('./cli');
const { getConfig, getStacks, getStages, executeCommand, getLabels } = require('./dmark');

function main() {
  showHelp();
  const cmd = getCommand();
  const config = getConfig();
  const stacks = getStacks(config);
  const stages = getStages(config);
  const labels = getLabels(config);
  executeCommand(cmd, config, {
    stacks,
    stages,
    labels,
    upgrade: checkFlag('upgrade', { shortCut: 'u', default: true }),
    fmt: checkFlag('fmt', { default: true }),
    migrateState: checkFlag('migrate-state', { default: true }),
    autoApprove: checkFlag('auto-approve', { default: true }),
  });
}

main();
