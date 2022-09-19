const { ChildProcessWithoutNullStreams } = require('child_process');

export = execCmd;
declare function execCmd(args: string[], cb: () => void): ChildProcessWithoutNullStreams;
