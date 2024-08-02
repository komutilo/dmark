const chalk = require('chalk');
const validateSchema = require('yaml-schema-validator/src');
const { execCmd } = require('../execCmd');
const { InvalidSchemaError } = require('../errors');

async function runQueue(tasks) {
  if (!this.current) this.current = 0;
  if (this.current >= tasks.length) return;

  const { label, task } = tasks[this.current];

  console.log(chalk.green(`[${this.current + 1}/${tasks.length}] ${label}`));

  await task(() => {
    tasks[this.current].executed = true;
    this.current += 1;
    runQueue(tasks);
  });
}

async function cmdTask(next, args) {
  const ps = await execCmd(args);
  if (ps.code !== 0) process.exit(ps.code);
  next();
}

function schemaValidation(obj, schemaObj, schemaName = '') {
  const schemaErrors = validateSchema(obj, {
    schema: schemaObj,
    logLevel: 'none',
  });

  if (Array.isArray(schemaErrors) && schemaErrors?.length > 0) {
    throw new InvalidSchemaError(schemaErrors, schemaName);
  }
}

module.exports = { runQueue, cmdTask, schemaValidation };
