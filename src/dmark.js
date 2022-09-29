/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable security/detect-object-injection */
const fs = require('fs');
const { resolve: pathResolve } = require('path');
const yaml = require('js-yaml');
const rimraf = require('rimraf');
const fse = require('fs-extra');
const mkdirp = require('mkdirp');
const { getArgValue } = require('./cli');
const execCmd = require('./execCmd');

const ALL_STAGES = '__all__';

function getConfig() {
  const pwd = pathResolve(process.cwd());
  const defaultConfigPath = pathResolve(pwd, 'dmark.config.yaml');
  const configArg = getArgValue('config', 'c');
  const configFilePath = configArg ? pathResolve(configArg) : defaultConfigPath;
  const noFileError = new Error(
    `The config file "${configFilePath}" don't exists.`,
  );

  if (fs.existsSync(configFilePath)) {
    const contents = fs.readFileSync(configFilePath, 'utf8');

    return yaml.load(contents);
  } else {
    throw noFileError;
  }
}

function getStacks(config) {
  if (!config) {
    throw new Error(
      'Execution error, no config provided to getStacks function.',
    );
  }

  const stacksArg = getArgValue('stacks');
  const stacks = stacksArg
    ? stacksArg.toString().split(',')
    : Object.keys(config.stacks);

  for (const stack of stacks) {
    if (!Object.keys(config.stacks).includes(stack)) {
      throw new Error(`The stack "${stack}" don't exists in the config file.`);
    }
  }

  return [...new Set(stacks)];
}

function getLabels(config) {
  if (!config) {
    throw new Error(
      'Execution error, no config provided to getLabels function.',
    );
  }

  if (!config.labels) return [];

  const labelsArg = getArgValue('labels');
  const labels = labelsArg
    ? labelsArg.toString().split(',')
    : Object.keys(config.labels);

  for (const label of labels) {
    if (!Object.keys(config.labels).includes(label)) {
      throw new Error(`The label "${label}" don't exists in the config file.`);
    }
  }

  return [...new Set(labels)];
}

function getValidStages(config) {
  if (!config) {
    throw new Error(
      'Execution error, no config provided to getValidStages function.',
    );
  }

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

function getStages(config) {
  if (!config) {
    throw new Error(
      'Execution error, no config provided to getStages function.',
    );
  }

  const stagesArg = getArgValue('stages');
  const validStages = getValidStages(config);

  if (!stagesArg) {
    return validStages;
  }

  const stages = stagesArg.toString().split(',');

  for (const stage of stages) {
    if (!validStages.includes(stage)) {
      throw new Error(`The stage "${stage}" is not a valid stage name.`);
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
    throw new Error(`Missing "path" field in the "${stackName}" stack.`);
  }

  const stackFolder = pathResolve(config.stacks[stackName].path);

  if (!fs.existsSync(stackFolder)) {
    throw new Error(`The path "${stackFolder}" didn't exists.`);
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

function getStackLabels(config, stackName) {
  const labels = [];

  if (config.globals?.labels) {
    labels.concat(config.globals.labels);
  }

  if (stackOnConfig(config, stackName)) {
    if (config.stacks[stackName]?.labels) {
      labels.concat(config.stacks[stackName].labels);
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

function executeCommand(cmd, config, opts) {
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
      if (ignoreStage(config, stackName, stageName)) continue;

      const stackFolder = getStackFolder(config, stackName);
      const vars = getVars(config, stackName, stageName);
      const backendConfig = getBackendConfig(config, stackName, stageName);
      const local = getLocal(config, stackName, stageName);
      let execInit = [];
      const isLocal = local ? true : false;

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

      if (opts?.migrateState) {
        execInit.push('-migrate-state');
      }

      if (opts?.upgrade) {
        execInit.push('-upgrade');
      }

      commandsQueue.push({
        args: execInit,
        pre: () => {
          console.log(
            `Running: ${JSON.stringify({ cmd, stackName, stageName })}`,
          );
          if (isLocal) {
            loadLocalState(config, stackName, stageName);
          } else {
            const localStatePath = pathResolve(stackFolder, '.terraform', 'terraform.tfstate');
            if (fs.existsSync(localStatePath)) fs.unlinkSync(localStatePath);
          }
        },
      });

      if (opts?.fmt) {
        const execFmt = [...vars, 'terraform', `-chdir=${stackFolder}`, 'fmt'];
        commandsQueue.push({ args: execFmt });
      }

      const exec = [...vars, 'terraform', `-chdir=${stackFolder}`, cmd];

      if (opts?.autoApprove && cmd !== 'plan') {
        exec.push('-auto-approve');
      }

      commandsQueue.push({
        args: exec,
        post: () => {
          if (isLocal) saveLocalState(config, stackName, stageName);
        },
      });
    }
  }

  commandsQueue.reverse();

  const recursiveQueue = () => {
    if (commandsQueue.length < 1) return;
    const { args, pre, post } = commandsQueue.pop();

    if (pre) pre();

    console.log(args.join(' '));

    execCmd(args, () => {
      if (post) post();
      recursiveQueue();
    });
  };

  recursiveQueue();
}

module.exports = {
  getConfig,
  getLabels,
  getStacks,
  getStages,
  executeCommand,
};
