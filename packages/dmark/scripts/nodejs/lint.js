const { runQueue, cmdTask } = require('../../src/utils');

const fix = process.argv.includes('--fix');
const eslintCmd = 'eslint -c ./config/.eslintrc --ignore-path ./config/.eslintignore';
const auditCmd = 'pnpm audit';

if (fix) {
  eslintCmd.push('--fix');
  auditCmd.push('--fix');
}

runQueue([
  {
    label: 'Executing the ESLint command...',
    task: async (next) => await cmdTask(next, eslintCmd),
  },
  {
    label: 'Executing the pnpm audit for all node modules...',
    task: async (next) => await cmdTask(next, auditCmd),
  },
]);
