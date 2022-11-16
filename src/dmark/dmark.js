/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable security/detect-object-injection */
const fs = require('fs');
const { resolve: pathResolve } = require('path');
const yaml = require('js-yaml');
const rimraf = require('rimraf');
const fse = require('fs-extra');
const mkdirp = require('mkdirp');
const { execCmd } = require('../execCmd');
const {
  InvalidConfigFileError,
  NoConfigProvidedError,
  InvalidStackNameError,
  InvalidStageNameError,
  MissingStackPathError,
  InvalidStackPathError,
} = require('../errors');
const { dmarkConfigSchemaValidator } = require('./dmarkConfigSchemaValidator');

/**
 * @typedef {Object} LocalConfig
 * @property {string} path
 */

/**
 * @typedef {Object} StageConfig
 * @property {Object.<string,string> | undefined} vars
 * @property {Object.<string,string> | undefined} backendConfig
 */

/**
 * @typedef {Object} GlobalStackConfig
 * @property {LocalConfig | boolean | undefined} local
 * @property {Object.<string, StageConfig> | undefined} stages
 * @property {string[] | undefined} labels
 */

/**
 * @typedef {GlobalStackConfig} StackConfig
 * @property {string} path
 * @property {string | undefined} description
 * @property {number | undefined} order
 */

/**
 * @typedef {Object} DmarkConfig
 * @property {GlobalStackConfig | undefined} globals
 * @property {Object.<string, StackConfig>} stacks
 */

/**
 * @typedef {Object} DmarkOptions
 * @property {string[]} stacks
 * @property {string[]} stages
 * @property {string[]} labels
 * @property {boolean} fmt
 * @property {boolean} initUpgrade
 * @property {boolean} initMigrateState
 * @property {boolean} autoApprove
 * @property {boolean} noInit
 * @property {boolean} deleteLock
 * @property {string[]} rest
 */

const ALL_STAGES = '__all__';

/**
 * Return the config object from a config file in the target project.
 * Default path is: ./dmark.config.yaml
 *
 * @param {string | undefined} configPath The custom config path.
 * @returns {DmarkConfig} The config loaded object.
 * @throws {InvalidConfigFileError} If a config file is not found.
 */
function getConfig(configPath) {
  const pwd = pathResolve(process.cwd());
  const defaultConfigPath = pathResolve(pwd, 'dmark.config.yaml');
  const configFilePath = configPath && configPath?.length >= 1 ? pathResolve(configPath[0]) : defaultConfigPath;

  if (fs.existsSync(configFilePath)) {
    const contents = fs.readFileSync(configFilePath, 'utf8');
    const config = yaml.load(contents);
    dmarkConfigSchemaValidator(config);
    return config;
  } else {
    throw new InvalidConfigFileError(configFilePath);
  }
}

/**
 * Get stack names to execute command on.
 * Return all stack names if no one is provided.
 *
 * @param {DmarkConfig} config The config object.
 * @param {string[] | undefined} stacks The stacks input.
 * @returns {string[]} The stacks names.
 * @throws {NoConfigProvidedError} if no config was provided.
 * @throws {InvalidStackNameError} if a provided stack name from input is not compatible with the ones in the config.
 */
function getStacks(config, stacks) {
  if (!config) {
    throw new NoConfigProvidedError('getStacks');
  }

  dmarkConfigSchemaValidator(config);

  stacks = stacks && Array.isArray(stacks) && stacks.length > 0
    ? stacks
    : Object.keys(config.stacks);

  for (const stack of stacks) {
    if (!Object.keys(config.stacks).includes(stack)) {
      throw new InvalidStackNameError(stack);
    }
  }

  return [...new Set(stacks)];
}

/**
 * Get input labels to filter or return none.
 *
 * @param {string[] | undefined} labels The input labels.
 * @returns {string[]} Input labels or no one.
 */
function getLabels(labels) {
  labels = labels && Array.isArray(labels) && labels.length > 0
    ? labels
    : [];

  return [...new Set(labels)];
}

function getValidStages(config) {
  if (!config) {
    throw new NoConfigProvidedError('getValidStages');
  }

  dmarkConfigSchemaValidator(config);

  let validStages = [];

  if (config.globals?.stages) {
    validStages = [...validStages, ...Object.keys(config.globals.stages)];
  }

  if (config.stacks) {
    for (const stackConfig of Object.values(config.stacks)) {
      if (stackConfig.stages) {
        validStages = [...validStages, ...Object.keys(stackConfig.stages)];
      }
    }
  }

  return [...new Set(validStages)].filter((vs) => vs !== ALL_STAGES);
}

/**
 * Get stage names to execute command on.
 * Return all stage names if no one is provided.
 *
 * @param {DmarkConfig} config The config object.
 * @param {string[] | undefined} stages The stages input.
 * @returns {string[]} The stages names.
 * @throws {NoConfigProvidedError} if no config was provided.
 * @throws {InvalidStageNameError} if a provided stage name from input is not compatible with the ones in the config.
 */
function getStages(config, stages) {
  if (!config) {
    throw new NoConfigProvidedError('getStages');
  }

  dmarkConfigSchemaValidator(config);

  const validStages = getValidStages(config);

  if (!stages || !Array.isArray(stages) || (stages?.length < 1)) {
    return validStages;
  }

  for (const stage of stages) {
    if (!validStages.includes(stage)) {
      throw new InvalidStageNameError(stage);
    }
  }

  return [...new Set(stages)].filter((vs) => vs !== ALL_STAGES);
}

function reOrderStacks(config, stackNames) {
  const stacks = [];
  let maxOrder = 0;

  for (const stackName of stackNames) {
    if (!stackOnConfig(config, stackName)) continue;

    const order = config.stacks[stackName].order;

    if (order) {
      if (order > maxOrder) maxOrder = order;

      stacks.push({
        name: stackName,
        order: order,
      });
    }
  }

  for (const stackName of stackNames.filter(
    (sn) => !stacks.map((s) => s.name).includes(sn),
  )) {
    if (!stackOnConfig(config, stackName)) continue;

    stacks.push({
      name: stackName,
      order: maxOrder + 1,
    });

    maxOrder += 1;
  }

  for (let i = 0; i < stacks.length; i++) {
    for (let j = 0; j < stacks.length - i - 1; j++) {
      if (stacks[j + 1].order < stacks[j].order) {
        [stacks[j + 1], stacks[j]] = [stacks[j], stacks[j + 1]];
      }
    }
  }

  return stacks.map((s) => s.name);
}

function stackOnConfig(config, stackName) {
  return config.stacks && Object.keys(config.stacks).includes(stackName);
}

function getStackFolder(config, stackName) {
  if (!config.stacks[stackName].path) {
    throw new MissingStackPathError(stackName);
  }

  const stackFolder = pathResolve(config.stacks[stackName].path);

  if (!fs.existsSync(stackFolder)) {
    throw new InvalidStackPathError(stackFolder);
  }

  return stackFolder;
}

function ignoreStage(config, stackName, stageName) {
  if (config.stacks[stackName].ignoreStages) {
    for (const ignoreStage of config.stacks[stackName].ignoreStages) {
      if (stageName === ignoreStage) {
        return true;
      }
    }
  }
  return false;
}

function getVars(config, stackName, stageName) {
  const vars = {};

  if (config.globals) {
    for (const [globalKey, globalValue] of Object.entries(
      config.globals.stages,
    )) {
      if (globalKey === stageName || globalKey === ALL_STAGES) {
        if (globalValue.vars) {
          for (const [varKey, varValue] of Object.entries(globalValue.vars)) {
            vars[varKey] = varValue;
          }
        }
      }
    }
  }

  if (stackOnConfig(config, stackName)) {
    if (
      config.stacks[stackName]?.stages &&
      Object.keys(config.stacks[stackName]?.stages).includes(ALL_STAGES) &&
      Object.keys(config.stacks[stackName]?.stages[ALL_STAGES]).includes('vars')
    ) {
      for (const [varKey, varValue] of Object.entries(
        config.stacks[stackName].stages[ALL_STAGES].vars,
      )) {
        vars[varKey] = varValue;
      }
    } else if (
      config.stacks[stackName]?.stages &&
      Object.keys(config.stacks[stackName]?.stages).includes(stageName) &&
      Object.keys(config.stacks[stackName]?.stages[stageName]).includes('vars')
    ) {
      for (const [varKey, varValue] of Object.entries(
        config.stacks[stackName].stages[stageName].vars,
      )) {
        vars[varKey] = varValue;
      }
    }
  }

  return Object.entries(vars).map(([k, v]) => `export TF_VAR_${k}=${v}`);
}

function getBackendConfig(config, stackName, stageName) {
  const backendConfig = {};

  if (config.globals) {
    for (const [globalKey, globalValue] of Object.entries(
      config.globals.stages,
    )) {
      if (globalKey === stageName || globalKey === ALL_STAGES) {
        if (globalValue.backendConfig) {
          for (const [varKey, varValue] of Object.entries(
            globalValue.backendConfig,
          )) {
            backendConfig[varKey] = varValue;
          }
        }
      }
    }
  }

  if (stackOnConfig(config, stackName)) {
    if (
      config.stacks[stackName]?.stages &&
      Object.keys(config.stacks[stackName]?.stages).includes(ALL_STAGES) &&
      Object.keys(config.stacks[stackName]?.stages[ALL_STAGES]).includes(
        'backendConfig',
      )
    ) {
      for (const [varKey, varValue] of Object.entries(
        config.stacks[stackName].stages[ALL_STAGES].backendConfig,
      )) {
        backendConfig[varKey] = varValue;
      }
    } else if (
      config.stacks[stackName]?.stages &&
      Object.keys(config.stacks[stackName]?.stages).includes(stageName) &&
      Object.keys(config.stacks[stackName]?.stages[stageName]).includes(
        'backendConfig',
      )
    ) {
      for (const [varKey, varValue] of Object.entries(
        config.stacks[stackName].stages[stageName].backendConfig,
      )) {
        backendConfig[varKey] = varValue;
      }
    }
  }

  return Object.entries(backendConfig).map(
    ([k, v]) => `-backend-config="${k}=${v}"`,
  );
}

function getLocalPath(config, stackName) {
  const stackFolder = getStackFolder(config, stackName);
  const localPath = config.stacks[stackName].local?.path
    ? pathResolve(config.stacks[stackName].local?.path)
    : stackFolder;

  if (!fs.existsSync(localPath)) {
    mkdirp.sync(localPath);
  }

  return localPath;
}

function loadLocalState(config, stackName, stageName) {
  const pwd = pathResolve(process.cwd());
  const stackFolder = getStackFolder(config, stackName);
  const localPath = getLocalPath(config, stackName);
  const statePathBackup = pathResolve(
    pwd,
    localPath,
    `terraform.${stackName}.${stageName}.tfstate`,
  );
  const statePath = pathResolve(pwd, stackFolder, 'terraform.tfstate');

  const copyBackupFunc = () => {
    if (fs.existsSync(statePathBackup)) {
      fse.copySync(statePathBackup, statePath, { overwrite: true });
    }
  };

  if (fs.existsSync(statePath)) {
    rimraf(statePath, () => {
      if (fs.existsSync(`${statePath}.backup`)) {
        rimraf(`${statePath}.backup`, copyBackupFunc);
      } else {
        copyBackupFunc();
      }
    });
  } else {
    copyBackupFunc();
  }
}

function saveLocalState(config, stackName, stageName) {
  const pwd = pathResolve(process.cwd());
  const stackFolder = getStackFolder(config, stackName);
  const localPath = getLocalPath(config, stackName);
  const statePathBackup = pathResolve(
    pwd,
    localPath,
    `terraform.${stackName}.${stageName}.tfstate`,
  );
  const statePath = pathResolve(pwd, stackFolder, 'terraform.tfstate');

  if (fs.existsSync(statePath)) {
    fse.copySync(statePath, statePathBackup, { overwrite: true });
    rimraf(statePath, () => {
      if (fs.existsSync(`${statePath}.backup`))
        rimraf(`${statePath}.backup`, () => null);
    });
  }
}

function deleteLockFile(config, stackName) {
  const pwd = pathResolve(process.cwd());
  const stackFolder = getStackFolder(config, stackName);
  const lockFilePath = pathResolve(pwd, stackFolder, '.terraform.lock.hcl');
  rimraf(lockFilePath, () => console.log(`"${lockFilePath}" removed...`));
}

function getStackLabels(config, stackName) {
  let labels = [];

  if (config.globals?.labels) {
    labels.concat(config.globals.labels);
  }

  if (stackOnConfig(config, stackName)) {
    if (config.stacks[stackName]?.labels) {
      labels = labels.concat(config.stacks[stackName].labels);
    }
  }

  return labels;
}

function getLocal(config, stackName) {
  let local = false;

  if (config.globals?.local) {
    local = config.globals.local;
  }

  if (stackOnConfig(config, stackName)) {
    if (config.stacks[stackName]?.local) {
      if (typeof config.stacks[stackName].local === 'object') {
        local = { ...local, ...config.stacks[stackName].local };
      } else {
        local = config.stacks[stackName].labels;
      }
    }
  }

  return local;
}

/**
 * Execute a terraform command.
 *
 * @param {string} cmd The command to execute.
 * @param {DmarkConfig} config The config object.
 * @param {DmarkOptions} opts The options.
 */
async function executeCommand(cmd, config, opts) {
  dmarkConfigSchemaValidator(config);

  const stacks = reOrderStacks(config, opts?.stacks);
  const commandsQueue = [];

  for (const stackName of stacks) {
    if (!stackOnConfig(config, stackName)) continue;

    const labels = getStackLabels(config, stackName);
    let stackPass = true;

    for (const label of opts?.labels || []) {
      if (!labels.includes(label)) {
        stackPass = false;
        break;
      }
    }

    if (!stackPass) continue;

    for (const stageName of opts?.stages || []) {
      if (ignoreStage(config, stackName, stageName)) {
        console.log(`Stage "${stageName}" ignored for the "${stackName}" stack...`);
        continue;
      }

      const stackFolder = getStackFolder(config, stackName);
      const vars = getVars(config, stackName, stageName);
      const backendConfig = getBackendConfig(config, stackName, stageName);
      const local = getLocal(config, stackName, stageName);
      let execInit = [];
      const isLocal = local ? true : false;
      const rest = opts?.rest && Array.isArray(opts?.rest) ? opts.rest : [];

      if (!opts?.noInit) {
        if (isLocal) {
          execInit = [...vars, 'terraform', `-chdir=${stackFolder}`, 'init'];
        } else {
          execInit = [
            ...vars,
            'terraform',
            `-chdir=${stackFolder}`,
            'init',
            ...backendConfig,
          ];
        }

        if (opts?.initMigrateState) {
          execInit.push('-migrate-state');
        }

        if (opts?.initUpgrade) {
          execInit.push('-upgrade');
        }

        if (cmd === 'init' && rest.length > 0) {
          execInit.concat(rest);
        }

        commandsQueue.push({
          args: execInit,
          pre: () => {
            console.log('\nRunning Terraform with: ----------------------------------------------------------------');
            console.log({ cmd, stackName, stageName, labels: opts?.labels });
            console.log('----------------------------------------------------------------------------------------\n');
            if (isLocal) {
              loadLocalState(config, stackName, stageName);
            } else {
              const localStatePath = pathResolve(stackFolder, '.terraform', 'terraform.tfstate');
              if (fs.existsSync(localStatePath)) fs.unlinkSync(localStatePath);
            }
            if (opts?.deleteLock) {
              deleteLockFile(config, stackName);
            }
          },
        });
      }

      if (opts?.fmt) {
        const execFmt = [...vars, 'terraform', `-chdir=${stackFolder}`, 'fmt'];

        if (cmd === 'fmt' && rest.length > 0) {
          execFmt.concat(rest);
        }

        commandsQueue.push({ args: execFmt });
      }

      if (cmd !== 'init' && cmd !== 'fmt') {
        const exec = [...vars, 'terraform', `-chdir=${stackFolder}`, cmd];

        if (opts?.autoApprove && cmd !== 'plan') {
          exec.push('-auto-approve');
        }

        if (rest.length > 0) {
          exec.concat(rest);
        }

        commandsQueue.push({
          args: exec,
          post: () => {
            if (isLocal) saveLocalState(config, stackName, stageName);
          },
        });
      }
    }
  }

  commandsQueue.reverse();

  const recursiveQueue = async () => {
    if (commandsQueue.length < 1) return;
    const { args, pre, post } = commandsQueue.pop();

    if (pre) pre();

    console.log(args.join(' '));

    const proc = await execCmd(args);

    if (proc.code !== 0) {
      process.exit(proc.code);
    }

    if (post) post();
    await recursiveQueue();
  };

  await recursiveQueue();
}

module.exports = {
  getConfig,
  getLabels,
  getStacks,
  getStages,
  executeCommand,
};
