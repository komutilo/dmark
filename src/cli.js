const VALID_COMMANDS = ['apply', 'plan', 'destroy'];

const HELP_TEXT = `
    DMARK CLI

    usage: dmark <command> [...options]

    commands:
    - apply                     Apply terraform resources.
    - plan                      Plan terraform resources.
    - destroy                   Destroy terraform resources.

    options:
    --help,-h                   Show this help text.
    --config,-c <path>          The config file path.
    --stacks <stacks names>     The stacks to execute the command.
                                Can be multiples separated by comma.
    --stages <stages names>     The stages to execute the command.
                                Can be multiples separated by comma.
    --upgrade,-u                Add the '-upgrade' flag to the 'terraform init' command.
    --fmt                       Flag to execute the 'terraform fmt' command.
    --auto-approve              Auto approve the confirmation input prompt.
    --migrate-state             Add the '-migrate-state' flag to the 'terraform init' command.

`;

function showHelp() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log(HELP_TEXT);
  }

  if (checkFlag('help', { default: false, shortCut: 'h' })) {
    console.log(HELP_TEXT);
    process.exit(0);
  }
}

function checkFlag(flagName, opts) {
  if (typeof flagName !== 'string') {
    throw new Error(`${flagName} is not a valid CLI flag.`);
  }

  const flagNameNormalized = `--${flagName.replace('-', '')}`;
  const args = process.argv.slice(2);
  let flagValue = opts?.default || false;

  if (args.includes(flagNameNormalized)) {
    flagValue = true;
  }

  if (opts?.shortCut && !flagValue) {
    const flagShortCutNormalized = `-${opts.shortCut.replace('-', '')[0]}`;

    if (args.includes(flagShortCutNormalized)) {
      flagValue = true;
    }
  }

  return flagValue;
}

function getArgValue(argName, shortCut) {
  if (typeof argName !== 'string') {
    throw new Error(`${argName} is not a valid CLI argument name.`);
  }

  const argNameNormalized = `--${argName.replace('-', '')}`;
  const args = process.argv.slice(2);
  let argIndex;

  if (args.includes(argNameNormalized)) {
    argIndex = args.indexOf(argNameNormalized);
  }

  if (shortCut && !argIndex) {
    const shortCutNormalized = `-${shortCut.replace('-', '')[0]}`;

    if (args.includes(shortCutNormalized)) {
      argIndex = args.indexOf(shortCutNormalized);
    }
  }

  if (typeof argIndex === 'undefined') return null;

  if (args.length <= argIndex + 1) {
    throw new Error(`"--${argName}" argument need a value after it.`);
  }

  return args[argIndex + 1];
}

function getCommand() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    throw new Error('No command provided.');
  }

  const cmd = args[0].toString().toLowerCase();

  if (cmd.includes('-') || !VALID_COMMANDS.includes(cmd)) {
    throw new Error(
      `"${cmd}" is a invalid command. Should be one of: ${VALID_COMMANDS}`,
    );
  }

  return cmd;
}

module.exports = {
  checkFlag,
  getArgValue,
  getCommand,
  showHelp,
};
