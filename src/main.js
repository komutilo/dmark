const chalk = require('chalk');
const { parseArgv } = require('./cli');
const {
  getConfig,
  getStacks,
  getLabels,
  getStages,
  getRunner,
  executeCommand,
} = require('./dmark');
const { cliConfig } = require('./cliConfig');

function main() {
  try {
    const { cmd, flags, options, rest } = parseArgv(cliConfig);

    const config = getConfig(options?.config);
    const stacks = getStacks(config, options?.stack);
    const stages = getStages(config, options?.stage);
    const labels = getLabels(options?.label);
    const runner = getRunner(config);

    executeCommand(cmd, config, {
      stacks,
      stages,
      labels,
      runner,
      fmt: flags?.fmt,
      initUpgrade: flags?.upgrade,
      initMigrateState: flags['migrate-state'],
      autoApprove: flags['auto-approve'],
      noInit: flags['no-init'],
      deleteLock: flags['delete-lock'],
      rest,
    });
  } catch (err) {
    console.error(chalk.red(`${err.name}: ${err.message}`));
    throw err;
  }
}

module.exports = { main };
