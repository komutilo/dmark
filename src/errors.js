class InvalidCliArgumentError extends Error {
  constructor(name) {
    const msg = `${name} is not a valid CLI argument.`;
    super(msg);
  }
}

class InvalidFirstArgumentError extends Error {
  constructor() {
    super('The first argument should be a command...');
  }
}

class InvalidSchemaError extends Error {
  constructor(schemaErrors, schemaName = '') {
    let msg = `${schemaName} schema validation error:\n`;
    msg += schemaErrors.map(err => `- ${err.path}: ${err.message}`).join('\n');
    super(msg);
  }
}

class InvalidConfigFileError extends Error {
  constructor(configPath) {
    super(`The config file "${configPath}" don't exists.`);
  }
}

class NoConfigProvidedError extends Error {
  constructor(functionName) {
    super(`Execution error, no config provided to ${functionName} function.`);
  }
}

class InvalidStackNameError extends Error {
  constructor(stackName) {
    super(`The stack "${stackName}" don't exists in the config file.`);
  }
}

class InvalidStageNameError extends Error {
  constructor(stageName) {
    super(`The stage "${stageName}" is not a valid stage name.`);
  }
}

class MissingStackPathError extends Error {
  constructor(stackName) {
    super(`Missing "path" field in the "${stackName}" stack.`);
  }
}

class InvalidStackPathError extends Error {
  constructor(stackPath) {
    super(`The path "${stackPath}" didn't exists.`);
  }
}

module.exports = {
  InvalidCliArgumentError,
  InvalidFirstArgumentError,
  InvalidSchemaError,
  InvalidConfigFileError,
  NoConfigProvidedError,
  InvalidStackNameError,
  InvalidStageNameError,
  MissingStackPathError,
  InvalidStackPathError,
};
