const fs = require('node:fs');
const chalk = require('chalk');
const rimraf = require('rimraf');
const { runQueue, cmdTask } = require('../../src/utils');

const isWindows = () => process.platform === 'win32';
const isMacOs = () => process.platform === 'darwin';

const OUTPUT_BIN_PATH = isWindows() ? 'build/dmark.exe' : 'build/dmark';

const createDir = (next, dirPath, removeFirst = true) => {
  if (removeFirst) {
    if (fs.existsSync(dirPath)) {
      rimraf(dirPath, () => {
        fs.mkdirSync(dirPath);
        next();
      });
    } else {
      fs.mkdirSync(dirPath);
      next();
    }
  } else {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
    next();
  }
}

runQueue([
  {
    label: 'Creating build/ folder...',
    task: async (next) => createDir(next, 'build'),
  },
  {
    label: 'Creating bundle file...',
    task: async (next) => await cmdTask(next, 'esbuild src/index.js --bundle --outdir=build --platform=node'),
  },
  {
    label: 'Building Node SEA blob file...',
    task: async (next) => await cmdTask(next, 'node --experimental-sea-config config/sea.config.json'),
  },
  {
    label: 'Copying Node binary...',
    task: async (next) => {
      fs.copyFileSync(process.execPath, OUTPUT_BIN_PATH);
      next();
    },
  },
  {
    label: 'Removing Node executable file signature...',
    task: async (next) => {
      if (isWindows()) {
        try {
          await cmdTask(next, `signtool remove /s ${OUTPUT_BIN_PATH}`);
          return;
        } catch {
          console.error(chalk.red('The signtool binary is not installed. Install it in: https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/'));
        }
      }

      if (isMacOs()) {
        await cmdTask(next, `codesign --remove-signature ${OUTPUT_BIN_PATH}`);
        return;
      }

      next();
    },
  },
  {
    label: 'Inject blob file in the executable...',
    task: async (next) => {
      const cmd = [
        'postject',
        OUTPUT_BIN_PATH,
        'NODE_SEA_BLOB',
        'build/dmark.blob',
        '--sentinel-fuse',
        'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2',
      ];

      if (isMacOs()) {
        cmd.push('--macho-segment-name');
        cmd.push('NODE_SEA');
      }
      await cmdTask(next, cmd);
    },
  },
  {
    label: 'Adding new signature to executable file...',
    task: async (next) => {
      if (isWindows()) {
        try {
          await cmdTask(next, `signtool sign /fd SHA256 ${OUTPUT_BIN_PATH}`);
          return;
        } catch {
          console.error(chalk.red('The signtool binary is not installed. Install it in: https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/'));
        }
      }

      if (isMacOs()) {
        await cmdTask(next, `codesign --sign - ${OUTPUT_BIN_PATH}`);
        return;
      }

      next();
    },
  },
  {
    label: 'Creating dist/ folder...',
    task: async (next) => createDir(next, 'dist'),
  },
  {
    label: 'Copying binary executable...',
    task: async (next) => {
      fs.copyFileSync(OUTPUT_BIN_PATH, OUTPUT_BIN_PATH.replace('build', 'dist'));
      next();
    },
  },
  {
    label: 'Removing build/ folder...',
    task: async (next) => {
      if (fs.existsSync('build')) {
        rimraf('build', () => null);
      }
      next();
    },
  },
]);
