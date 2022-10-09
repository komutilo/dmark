const { crossEnv } = require('./utils/crossEnv');
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
    task: (next) => crossEnv(eslintCmd, next),
  },
  {
    label: 'Executing the pnpm audit for all node modules...',
    task: (next) => crossEnv(auditCmd, next),
  },
]);
