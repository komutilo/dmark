class InvalidCliArgumentError extends Error {
  constructor(name) {
    const msg = `${name} is not a valid CLI argument.`;
    super(msg);
    this.name = 'InvalidCliArgumentError';
  }
}

class InvalidFirstArgumentError extends Error {
  constructor() {
    super('The first argument should be a command...');
    this.name = 'InvalidFirstArgumentError';
  }
}

class InvalidSchemaError extends Error {
  constructor(schemaErrors, schemaName = '') {
    let msg = `${schemaName} schema validation error:\n`;
    msg += schemaErrors.map(err => `- ${err.path}: ${err.message}`).join('\n');
    super(msg);
    this.name = 'InvalidSchemaError';
  }
}

class InvalidConfigFileError extends Error {
  constructor(configPath) {
    super(`The config file "${configPath}" don't exists.`);
    this.name = 'InvalidConfigFileError';
  }
}

class NoConfigProvidedError extends Error {
  constructor(functionName) {
    super(`Execution error, no config provided to ${functionName} function.`);
    this.name = 'NoConfigProvidedError';
  }
}

class InvalidStackNameError extends Error {
  constructor(stackName) {
    super(`The stack "${stackName}" don't exists in the config file.`);
    this.name = 'InvalidStackNameError';
  }
}

class InvalidStageNameError extends Error {
  constructor(stageName) {
    super(`The stage "${stageName}" is not a valid stage name.`);
    this.name = 'InvalidStageNameError';
  }
}

class MissingStackPathError extends Error {
  constructor(stackName) {
    super(`Missing "path" field in the "${stackName}" stack.`);
    this.name = 'MissingStackPathError';
  }
}

class InvalidStackPathError extends Error {
  constructor(stackPath) {
    super(`The path "${stackPath}" didn't exists.`);
    this.name = 'InvalidStackPathError';
  }
}

class MissingStageNameError extends Error {
  constructor() {
    super(`There is no stage name defined in config file. Example:

globals:
  stages:
    dev: {}
`);
    this.name = 'MissingStageNameError';
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
  MissingStageNameError,
};
