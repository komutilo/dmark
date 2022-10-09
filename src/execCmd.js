const cp = require('promisify-child-process');
const commandConvert = require('cross-env/src/command');
const varValueConvert = require('cross-env/src/variable');
const parse = require('cross-spawn/lib/parse');

async function spawn(command, args, options) {
  const parsed = parse(command, args, options);
  return await cp.spawn(parsed.command, parsed.args, parsed.options);
}

async function execCmd(args) {
  const envSetterRegex = /(\w+)=('(.*)'|"(.*)"|(.*))/;
  const envSetters = {};
  let command = null;
  let commandArgs = [];

  for (let i = 0; i < args.length; i++) {
    // eslint-disable-next-line security/detect-object-injection
    const match = envSetterRegex.exec(args[i]);
    if (match) {
      let value;

      if (typeof match[3] !== 'undefined') {
        value = match[3];
      } else if (typeof match[4] === 'undefined') {
        value = match[5];
      } else {
        value = match[4];
      }

      envSetters[match[1]] = value;
    } else {
      let cStart = [];
      cStart = args.slice(i).map((a) => {
        const re = /\\\\|(\\)?'|([\\])(?=[$"\\])/g;
        return a.replace(re, (m) => {
          if (m === '\\\\') return '\\';
          if (m === '\\\'') return '\'';
          return '';
        });
      });
      command = cStart[0];
      commandArgs = cStart.slice(1);
      break;
    }
  }

  const env = { ...process.env };

  if (process.env.APPDATA) {
    env.APPDATA = process.env.APPDATA;
  }

  Object.keys(envSetters).forEach((varName) => {
    // eslint-disable-next-line security/detect-object-injection
    env[varName] = varValueConvert(envSetters[varName], varName);
  });

  if (command) {
    return await spawn(
      commandConvert(command, env, true),
      commandArgs.map((arg) => commandConvert(arg, env)),
      {
        stdio: 'inherit',
        shell: true,
        env,
      },
    );
  }

  return null;
}

module.exports = execCmd;
