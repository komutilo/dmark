const spawk = require('spawk');
const execCmd = require('./execCmd');

describe('execCmd function', () => {
  beforeEach(() => {
    spawk.clean();
    spawk.preventUnmatched();
  });

  afterEach(() => {
    spawk.done();
    jest.clearAllMocks();
  });

  it('should call terraform command with passed args', async () => {
    const mockTf = spawk.spawn('terraform');
    const argv = 'terraform apply --refresh --foo bar'.split(' ');

    const proc = await execCmd(argv);

    expect(proc.code).toBe(0);

    expect(mockTf.calledWith).toMatchObject({
      args: [
        'apply',
        '--refresh',
        '--foo', 'bar',
      ],
      options: { stdio: 'inherit', shell: true },
    });
  });
});
