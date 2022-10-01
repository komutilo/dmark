const columnify = require('columnify');

function removeArgPrefix(arg) {
  const pattern = new RegExp(/^([-]{1,2}|)(.*)$/gm);
  const matches = arg.matchAll(pattern);
  for (const match of matches) {
    if (match.length >= 3) {
      return match[2];
    }
  }
  return null;
}

function fixArgs(name, shortCut) {
  if (typeof name !== 'string' && !Array.isArray(name)) {
    throw new Error(`${name} is not a valid CLI argument.`);
  }

  let shortCuts = [];
  let names = !Array.isArray(name) ? [name] : name;
  names = names.map((n) => `--${removeArgPrefix(n)}`);

  if (shortCut && (typeof shortCut === 'string' || Array.isArray(shortCut))) {
    shortCuts = !Array.isArray(shortCut) ? [shortCut] : shortCut;
    shortCuts = shortCuts.map((s) => `-${removeArgPrefix(s)}`);
  }

  return [...names, ...shortCuts];
}

function checkFlag(name, shortCut, args) {
  const flags = fixArgs(name, shortCut);
  const key = Array.isArray(name) ? name.length > 0 && name[0] : name;

  for (const flag of flags) {
    if (args.includes(flag)) {
      return { key, value: true, index: args.indexOf(flag) };
    }
  }

  return { key, value: false };
}

function getCliOptionValues(keys, shortCut, args) {
  const variants = fixArgs(keys, shortCut);
  const key = Array.isArray(keys) ? keys.length > 0 && keys[0] : keys;
  const indexes = [];
  const values = [];

  for (const variant of variants) {
    const cliArgsStack = args.map((arg, index) => { return { arg, index }; });
    let lastCliArg = null;

    while (cliArgsStack.length > 0) {
      const cliArg = cliArgsStack.pop();

      if (lastCliArg && cliArg.arg === variant) {
        values.push(lastCliArg.arg);
        indexes.push(lastCliArg.index);
        indexes.push(cliArg.index);
      }

      lastCliArg = cliArg;
    }
  }

  return { key, values, indexes };
}

function mountHelpText(_, validFlags, validOptions) {
  let helpText = `
DMARK CLI

usage: dmark <terraform command> [...options] [...teraform options]

options:
`;

  const columnsData = {};

  for (const validOption of validOptions) {
    const option = fixArgs(validOption.name, validOption.shortCut);
    columnsData[option.join(',')] = validOption.description;
  }

  for (const validFlag of validFlags) {
    const flag = fixArgs(validFlag.name, validFlag.shortCut);
    columnsData[flag.join(',')] = validFlag.description;
  }

  helpText += `${columnify(columnsData, { columns: ['OPTION', 'DESCRIPTION'] })}\n`;
  return helpText;
}

function showHelp(cmd, validFlags, validOptions) {
  const args = process.argv.slice(2);

  const helpText = mountHelpText(cmd, validFlags, validOptions);

  if (args.length < 1) {
    console.log(helpText);
    process.exit(1);
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(helpText);
    process.exit(0);
  }
}

function getFlags(validFlags, argv) {
  const flags = {};
  const indexes = [];

  if (!Array.isArray(validFlags)) {
    return { flags };
  }

  for (const validFlag of validFlags) {
    const { key, value, index } = checkFlag(validFlag.name, validFlag.shortCut, argv);
    // eslint-disable-next-line security/detect-object-injection
    flags[key] = value;
    if (typeof index === 'number') indexes.push(index);
  }

  return { flags, indexes };
}

function getOptions(validOptions, argv) {
  const options = {};
  let indexes = [];

  if (!Array.isArray(validOptions)) {
    return { options };
  }

  for (const validOption of validOptions) {
    const { key, values, indexes: optIndexes } = getCliOptionValues(validOption.name, validOption.shortCut, argv);
    // eslint-disable-next-line security/detect-object-injection
    options[key] = values;
    indexes = indexes.concat(optIndexes);
  }

  return { options, indexes };
}

function parseArgv({ validFlags, validOptions }) {
  if (process.argv.length < 3) {
    showHelp(null, validFlags, validOptions);
  }

  let argv = [...process.argv.slice(2)];

  if (argv[0][0] === '-') {
    throw new Error('The first argument should be a command...');
  }

  const cmd = argv[0].toString().toLowerCase();
  argv = argv.slice(1);

  const { flags, indexes: flagsIndexes } = getFlags(validFlags, argv);
  argv = argv.filter((_, index) => !flagsIndexes.includes(index));

  const { options, indexes: optsIndexes } = getOptions(validOptions, argv);
  argv = argv.filter((_, index) => !optsIndexes.includes(index));

  return {
    cmd,
    flags,
    options,
    rest: argv,
    showHelp: () => showHelp(cmd, validFlags, validOptions),
  };
}

module.exports = {
  parseArgv,
};
