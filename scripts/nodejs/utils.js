const chalk = require('chalk');
const execCmd = require('../../src/execCmd');

const runQueue = async (tasks) => {
  if (!this.current) this.current = 0;
  if (this.current >= tasks.length) return;

  const { label, task } = tasks[this.current];

  console.log(chalk.green(`[${this.current + 1}/${tasks.length}] ${label}`));

  await task(() => {
    tasks[this.current].executed = true;
    this.current += 1;
    runQueue(tasks);
  });
};

const cmdTask = async (next, args) => {
  const ps = await execCmd(args);
  if (ps.code !== 0) process.exit(ps.code);
  next();
};

module.exports = { runQueue, cmdTask };
