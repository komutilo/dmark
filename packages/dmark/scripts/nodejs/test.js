const { runQueue, cmdTask } = require('../../src/utils');

const watch = process.argv.includes('--watch');
const coverage = process.argv.includes('--coverage');
const jestCmd = 'jest --config=./config/jest.config.js --forceExit --detectOpenHandles';

jestCmd.push(watch ? '--watch' : '--watchAll=false');

if (coverage) {
  jestCmd.push('--coverage');
}

runQueue([
  {
    label: 'Running Jest tests...',
    task: async (next) => await cmdTask(next, jestCmd),
  },
]);
