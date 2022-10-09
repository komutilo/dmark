const execCmd = require('../../src/execCmd');
const { runQueue } = require('./utils/runQueue');

const fix = process.argv.includes('--fix');
const eslintCmd = ['eslint', '-c', './.eslintrc', '--ignore-path', './.eslintignore'];
const auditCmd = ['pnpm', 'audit'];

if (fix) {
  eslintCmd.push('--fix');
  auditCmd.push('--fix');
}

runQueue([
  {
    label: 'Executing the ESLint command...',
    task: (next) => execCmd(eslintCmd, next),
  },
  {
    label: 'Executing the pnpm audit for all node modules...',
    task: (next) => execCmd(auditCmd, next),
  },
]);
