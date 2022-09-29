const VALID_COMMANDS = ['apply', 'plan', 'destroy', 'init', 'fmt', 'console', 'validate', 'graph', 'output', 'providers', 'refresh', 'show', 'get', 'test'];

const HELP_TEXT = `
    DMARK CLI

    usage: dmark <command> [...options]

    commands:
    - init                      Prepare your working directory for other commands
    - validate                  Check whether the configuration is valid
    - plan                      Show changes required by the current configuration
    - apply                     Create or update infrastructure
    - destroy                   Destroy previously-created infrastructure
    - console                   Try Terraform expressions at an interactive command prompt
    - fmt                       Reformat your configuration in the standard style
    - get                       Install or upgrade remote Terraform modules
    - graph                     Generate a Graphviz graph of the steps in an operation
    - output                    Show output values from your root module
    - providers                 Show the providers required for this configuration
    - refresh                   Update the state to match remote systems
    - show                      Show the current state or a saved plan
    - test                      Experimental support for module integration testing

    options:
    --help,-h                   Show this help text
    --config,-c <path>          The config file path
    --stack <stack name>        The stack(s) to execute the command
    --stage <stage name>        The stage(s) to execute the command
    --label,-l <label name>     The label(s) to filter the stacks
    --upgrade,-u                Add the '-upgrade' flag to the 'terraform init' command
    --fmt                       Flag to execute the 'terraform fmt' command
    --auto-approve              Auto approve the confirmation input prompt
    --migrate-state             Add the '-migrate-state' flag to the 'terraform init' command

`;

function showHelp() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log(HELP_TEXT);
  }

  if (checkFlag('help', { shortCut: 'h' })) {
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
  let flagValue = false;

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

function getArgValues(argVariants) {
  if (!(Array.isArray(argVariants)) && (typeof argVariants !== 'string')) {
    throw new Error(`${argVariants} is not a valid CLI argument name.`);
  }

  const variants = typeof argVariants === 'string' ? [argVariants] : argVariants;

  const cliArgs = process.argv.slice(2);
  const values = [];

  for (const variant of variants) {
    const cliArgsStack = [...cliArgs];
    let lastCliArg = null;

    while (cliArgsStack.length > 0) {
      const cliArg = cliArgsStack.pop();

      if (lastCliArg && cliArg === variant) {
        values.push(lastCliArg);
      }

      lastCliArg = cliArg;
    }
  }

  return values;
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
  getArgValues,
  getCommand,
  showHelp,
};
