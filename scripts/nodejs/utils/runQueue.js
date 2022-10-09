const chalk = require('chalk');

const runQueue = (tasks) => {
  if (!this.current) this.current = 0;
  if (this.current >= tasks.length) return;

  const { label, task } = tasks[this.current];

  console.log(chalk.green(`[${this.current + 1}/${tasks.length}] ${label}`));

  task(() => {
    tasks[this.current].executed = true;
    this.current += 1;
    runQueue(tasks);
  });
};

module.exports = { runQueue };
