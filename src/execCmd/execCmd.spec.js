const spawk = require('spawk');
const { execCmd } = require('./execCmd');

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

  it('should define environment variable on call execCmd function with variable definition on argv', async () => {
    const mockTf = spawk.spawn('terraform');
    const argv = 'ENV_TEST=is-a-env-test terraform apply --refresh --foo bar'.split(' ');

    const proc = await execCmd(argv);

    expect(proc.code).toBe(0);

    expect(mockTf.calledWith).toMatchObject({
      args: [
        'apply',
        '--refresh',
        '--foo', 'bar',
      ],
      options: {
        stdio: 'inherit',
        shell: true,
        env: { 'ENV_TEST': 'is-a-env-test' },
      },
    });
  });
});
