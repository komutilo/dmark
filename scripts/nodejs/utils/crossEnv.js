const commandConvert = require('cross-env/src/command');
const varValueConvert = require('cross-env/src/variable');
const { spawn } = require('cross-spawn');

function crossEnv(args, cb) {
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
        const proc = spawn(
            commandConvert(command, env, true),
            commandArgs.map((arg) => commandConvert(arg, env)),
            {
                stdio: 'inherit',
                shell: true,
                env,
            },
        );
        process.on('SIGTERM', () => proc.kill('SIGTERM'));
        process.on('SIGINT', () => proc.kill('SIGINT'));
        process.on('SIGBREAK', () => proc.kill('SIGBREAK'));
        process.on('SIGHUP', () => proc.kill('SIGHUP'));
        proc.on('exit', (code, signal) => {
            let crossEnvExitCode = code;
            if (crossEnvExitCode === null) {
                crossEnvExitCode = signal === 'SIGINT' ? 0 : 1;
            }
            if (crossEnvExitCode !== 0) {
                throw new Error(`child process exit with code ${crossEnvExitCode}`);
            }
            if (cb) cb();
        });
        return proc;
    }

    return null;
}

module.exports = crossEnv;
