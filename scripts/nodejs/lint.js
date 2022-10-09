const { runQueue, cmdTask } = require('./utils');

const fix = process.argv.includes('--fix');
const eslintCmd = 'eslint -c ./.eslintrc --ignore-path ./.eslintignore'.split(' ');
const auditCmd = 'pnpm audit'.split(' ');

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
