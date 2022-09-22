const chalk = require('chalk');
const crossEnv = require('./utils/crossEnv');

const fix = process.argv.includes('--fix');
const eslintCmd = ['eslint', '-c', './.eslintrc', '--ignore-path', './.eslintignore'];
const auditCmd = ['pnpm', 'audit'];

if (fix) {
    eslintCmd.push('--fix');
    auditCmd.push('--fix');
}

const tasks = [
    {
        label: 'Executing the ESLint command...',
        task: (next) => crossEnv(eslintCmd, next),
    },
    {
        label: 'Executing the pnpm audit for all node modules...',
        task: (next) => crossEnv(auditCmd, next),
    },
];

const runQueue = () => {
    if (!this.current) this.current = 0;
    if (this.current >= tasks.length) return;

    const { label, task } = tasks[this.current];

    console.log(chalk.green(`[${this.current + 1}/${tasks.length}] ${label}`));

    task(() => {
        tasks[this.current].executed = true;
        this.current += 1;
        runQueue();
    });
};

runQueue();
