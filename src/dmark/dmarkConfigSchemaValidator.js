const { InvalidSchemaError } = require('../errors');
const { schemaValidation } = require('../utils');

/**
 * @typedef {Object} DmarkConfigSchemaValidatorOptions
 * @property {boolean | undefined} forceValidation
 */

let VALID = false;

const LOCAL_SCHEMA = {
  path: {
    type: 'string',
    required: true,
  },
};

const VALID_GLOBAL_FIELDS = ['local', 'stages', 'labels'];

function missingError(path) {
  throw new InvalidSchemaError([{
    path,
    message: `Missing ${path} field in the config file.`,
  }], 'dmark.config');
}

function typeMismatchError(path, types) {
  throw new InvalidSchemaError([{
    path,
    message: `Invalid type for ${path} field in the config file. Should be one of types: ${types.join(', ')}`,
  }], 'dmark.config');
}

function validateLocal(local, path) {
  if (local === 0) {
    typeMismatchError(path, [
      'boolean',
      JSON.stringify(LOCAL_SCHEMA),
      'undefined',
      'null',
    ]);
  }
  if (!local) return true;
  if (typeof local === 'boolean') return true;
  if (typeof local !== 'object' || Array.isArray(local)) {
    typeMismatchError(path, [
      'boolean',
      JSON.stringify(LOCAL_SCHEMA),
      'undefined',
      'null',
    ]);
  }
  schemaValidation(local, LOCAL_SCHEMA);
  return true;
}

function validateStage(stage, path) {
  let validSchema = true;
  const errors = [];
  if (stage?.vars) {
    if (typeof stage.vars !== 'object') {
      typeMismatchError(`${path}.vars`, ['object']);
    }
    for (const [k, v] of Object.entries(stage.vars)) {
      if (typeof k !== 'string' || typeof v !== 'string') {
        validSchema = false;
        errors.push({
          path: `${path}.vars.${k}`,
          message: `Invalid type for ${path}.vars.${k} field in the config file. Should be one of types: string`,
        });
      }
    }
  }
  if (stage?.backendConfig) {
    if (typeof stage.backendConfig !== 'object') {
      typeMismatchError(`${path}.backendConfig`, ['object']);
    }
    for (const [k, v] of Object.entries(stage.backendConfig)) {
      if (typeof k !== 'string' || typeof v !== 'string') {
        validSchema = false;
        errors.push({
          path: `${path}.backendConfig.${k}`,
          message: `Invalid type for ${path}.backendConfig.${k} field in the config file. Should be one of types: string`,
        });
      }
    }
  }
  if (!validSchema) {
    throw new InvalidSchemaError(errors, 'dmark.config');
  }
  return validSchema;
}

function validateStages(stages, path) {
  if (!stages) return true;
  if (typeof stages !== 'object') {
    typeMismatchError(path, ['object']);
  }
  if (Object.keys(stages).length <= 0) {
    throw new InvalidSchemaError([{
      path,
      message: 'No stage provided in config. Should have at least one.',
    }], 'dmark.config');
  }
  for (const [key, value] of Object.entries(stages)) {
    const valid = validateStage(value, `${path}.${key}`);
    if (!valid) return false;
  }
  return true;
}

function validateLabels(labels, path) {
  if (!labels) return true;
  if (!Array.isArray(labels)) {
    typeMismatchError(path, ['string[]']);
  }
  for (const label of labels) {
    if (typeof label !== 'string') {
      typeMismatchError(`${path}.${label}`, ['string']);
    }
  }
  return true;
}

function validateGlobalStack(stack, path) {
  if (Array.isArray(stack) || typeof stack !== 'object') {
    typeMismatchError(path, ['object']);
  }
  if (path === 'globals') {
    for (const key of Object.keys(stack)) {
      if (!VALID_GLOBAL_FIELDS.includes(key)) {
        throw new InvalidSchemaError([{
          path,
          message: `${path} could only have the fields: ${VALID_GLOBAL_FIELDS.join(', ')}`,
        }], 'dmark.config');
      }
    }
  }
  return validateLocal(stack?.local, `${path}.local`) &&
    validateStages(stack?.stages, `${path}.stages`) &&
    validateLabels(stack?.labels, `${path}.labels`);
}

function validateStack(stack, path) {
  let valid = validateGlobalStack(stack, path);

  if (!stack?.path) {
    missingError(`${path}.path`);
  }
  if (typeof stack.path !== 'string') {
    typeMismatchError(`${path}.path`, ['string']);
  }

  if (stack?.description) {
    if (typeof stack.description !== 'string') {
      typeMismatchError(`${path}.description`, ['string']);
    }
  }

  if (stack?.order) {
    if (typeof stack.order !== 'number') {
      typeMismatchError(`${path}.order`, ['number']);
    }
  }

  return valid;
}

function validateStacks(stacks) {
  const path = 'stacks';
  if (typeof stacks !== 'object') {
    typeMismatchError(path, ['object']);
  }
  if (Object.keys(stacks).length <= 0) {
    throw new InvalidSchemaError([{
      path,
      message: 'No stack provided in config. Should have at least one.',
    }], 'dmark.config');
  }
  for (const [k, v] of Object.entries(stacks)) {
    const valid = validateStack(v, `${path}.${k}`);
    if (!valid) return false;
  }
  return true;
}

/**
 * Validate the dmark config file schema.
 *
 * @param {import("./dmark").DmarkConfig} config The config object.
 * @param {DmarkConfigSchemaValidatorOptions | undefined} opts Validator options.
 * @returns {boolean} If the config is valid.
 * @throws {InvalidSchemaError} throws an error if the field is missing or mismatch a type.
 */
function dmarkConfigSchemaValidator(config, opts) {
  const forceValidation = opts?.forceValidation || false;

  if (VALID === true && !forceValidation) return VALID;

  if (config?.globals) {
    VALID = validateGlobalStack(config?.globals, 'globals');
  }

  if (!config?.stacks) {
    missingError('stacks');
  }

  VALID = validateStacks(config.stacks);

  return VALID;
}

module.exports = { dmarkConfigSchemaValidator };
