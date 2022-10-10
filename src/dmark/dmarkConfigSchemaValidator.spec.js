const { dmarkConfigSchemaValidator } = require('./dmarkConfigSchemaValidator');
const { InvalidSchemaError } = require('../errors');

describe('dmarkConfigSchemaValidator function', () => {
  const validatorOpts = { forceValidation: true };

  it('should fail for empty or null config', () => {
    const emptyConfig = () => dmarkConfigSchemaValidator({}, validatorOpts);
    const nullConfig = () => dmarkConfigSchemaValidator(null, validatorOpts);
    const undefinedConfig = () => dmarkConfigSchemaValidator(undefined, validatorOpts);

    expect(emptyConfig).toThrow(InvalidSchemaError);
    expect(nullConfig).toThrow(InvalidSchemaError);
    expect(undefinedConfig).toThrow(InvalidSchemaError);
  });

  it('should validate with success minimal stack config', () => {
    const config = {
      stacks: {
        foo: {
          path: '.',
        },
      },
    };

    const validateConfig = () => dmarkConfigSchemaValidator(config, validatorOpts);

    expect(validateConfig).not.toThrow(InvalidSchemaError);
  });

  it('should fail with no string in field path in stack config', () => {
    const config = {
      stacks: {
        foo: {
          path: 23,
        },
      },
    };

    const validateConfig = () => dmarkConfigSchemaValidator(config, validatorOpts);

    expect(validateConfig).toThrow(InvalidSchemaError);
  });

  it('should fail with no string in field description in stack config', () => {
    const config = {
      stacks: {
        foo: {
          path: '.',
          description: 534,
        },
      },
    };

    const validateConfig = () => dmarkConfigSchemaValidator(config, validatorOpts);

    expect(validateConfig).toThrow(InvalidSchemaError);
  });

  it('should fail with no number in field order in stack config', () => {
    const config = {
      stacks: {
        foo: {
          path: '.',
          description: 'Foo description.',
          order: '1',
        },
      },
    };

    const validateConfig = () => dmarkConfigSchemaValidator(config, validatorOpts);

    expect(validateConfig).toThrow(InvalidSchemaError);
  });

  it('should validate with success two stacks with basic fields', () => {
    const config = {
      stacks: {
        foo: {
          path: './src/foo',
          description: 'Foo description.',
          order: 2,
        },
        bar: {
          path: './src/bar',
          description: 'Bar description.',
          order: 1,
        },
      },
    };

    const validateConfig = () => dmarkConfigSchemaValidator(config, validatorOpts);

    expect(validateConfig).not.toThrow(InvalidSchemaError);
  });

  it('should fail with invalid values in local field at stack config', () => {
    let config = {
      stacks: {
        foo: {
          path: './src/foo',
          description: 'Foo description.',
          order: 2,
        },
      },
    };

    expect(() => {
      config.stacks.foo.local = 0;
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).toThrow(InvalidSchemaError);

    expect(() => {
      config.stacks.foo.local = 542;
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).toThrow(InvalidSchemaError);

    expect(() => {
      config.stacks.foo.local = Symbol('local-symbol');
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).toThrow(InvalidSchemaError);

    expect(() => {
      config.stacks.foo.local = [];
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).toThrow(InvalidSchemaError);

    expect(() => {
      config.stacks.foo.local = { bar: 'baz' };
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).toThrow(InvalidSchemaError);
  });

  it('should validate with success local field with valid values at stack config', () => {
    let config = {
      stacks: {
        foo: {
          path: './src/foo',
          description: 'Foo description.',
          order: 2,
        },
      },
    };

    expect(() => {
      config.stacks.foo.local = false;
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).not.toThrow(InvalidSchemaError);

    expect(() => {
      config.stacks.foo.local = undefined;
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).not.toThrow(InvalidSchemaError);

    expect(() => {
      config.stacks.foo.local = null;
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).not.toThrow(InvalidSchemaError);

    expect(() => {
      config.stacks.foo.local = true;
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).not.toThrow(InvalidSchemaError);

    expect(() => {
      config.stacks.foo.local = { path: './data/foo' };
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).not.toThrow(InvalidSchemaError);
  });

  it('should fail for invalid values on stages field at stack config', () => {
    let config = {
      stacks: {
        foo: {
          path: './src/foo',
          description: 'Foo description.',
          order: 2,
          local: { path: './data/foo' },
        },
      },
    };

    expect(() => {
      config.stacks.foo.stages = 23;
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).toThrow(InvalidSchemaError);

    expect(() => {
      config.stacks.foo.stages = [];
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).toThrow(InvalidSchemaError);

    expect(() => {
      config.stacks.foo.stages = Symbol('config-foo-stages');
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).toThrow(InvalidSchemaError);

    expect(() => {
      config.stacks.foo.stages = {};
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).toThrow(InvalidSchemaError);
  });

  it('should validate with success for valid values on stages field at stack config', () => {
    let config = {
      stacks: {
        foo: {
          path: './src/foo',
          description: 'Foo description.',
          order: 2,
          local: { path: './data/foo' },
        },
      },
    };

    expect(() => {
      config.stacks.foo.stages = { bar: {} };
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).not.toThrow(InvalidSchemaError);

    expect(() => {
      config.stacks.foo.stages = { bar: { vars: { baz: 'test' } } };
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).not.toThrow(InvalidSchemaError);

    expect(() => {
      config.stacks.foo.stages = {
        bar: {
          vars: { baz: 'test' },
          backendConfig: { baz: 'test' },
        },
      };
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).not.toThrow(InvalidSchemaError);
  });

  it('should fail for invalid values on labels field at stack config', () => {
    let config = {
      stacks: {
        foo: {
          path: './src/foo',
          description: 'Foo description.',
          order: 2,
          local: { path: './data/foo' },
          stages: {
            bar: {
              vars: { baz: 'test' },
              backendConfig: { baz: 'test' },
            },
          },
        },
      },
    };

    expect(() => {
      config.stacks.foo.labels = 23;
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).toThrow(InvalidSchemaError);

    expect(() => {
      config.stacks.foo.labels = [2, 3];
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).toThrow(InvalidSchemaError);

    expect(() => {
      config.stacks.foo.labels = Symbol('config-foo-labels');
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).toThrow(InvalidSchemaError);

    expect(() => {
      config.stacks.foo.labels = {};
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).toThrow(InvalidSchemaError);
  });

  it('should validate with success for valid values on labels field at stack config', () => {
    let config = {
      stacks: {
        foo: {
          path: './src/foo',
          description: 'Foo description.',
          order: 2,
          local: { path: './data/foo' },
          stages: {
            bar: {
              vars: { baz: 'test' },
              backendConfig: { baz: 'test' },
            },
          },
        },
      },
    };

    expect(() => {
      config.stacks.foo.labels = [];
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).not.toThrow(InvalidSchemaError);

    expect(() => {
      config.stacks.foo.labels = ['2', '3'];
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).not.toThrow(InvalidSchemaError);

    expect(() => {
      config.stacks.foo.labels = ['label-test'];
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).not.toThrow(InvalidSchemaError);
  });

  it('should fail with invalid values on globals field at config', () => {
    let config = {
      stacks: {
        foo: {
          path: './src/foo',
        },
      },
    };

    expect(() => {
      config.globals = [];
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).toThrow(InvalidSchemaError);

    expect(() => {
      config.globals = 59;
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).toThrow(InvalidSchemaError);

    expect(() => {
      config.globals = 'global-field';
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).toThrow(InvalidSchemaError);

    expect(() => {
      config.globals = true;
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).toThrow(InvalidSchemaError);

    expect(() => {
      config.globals = Symbol('config-globals');
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).toThrow(InvalidSchemaError);

    expect(() => {
      config.globals = { path: './src/foo' };
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).toThrow(InvalidSchemaError);
  });

  it('should validate with success with valid values on globals field at config', () => {
    let config = {
      stacks: {
        foo: {
          path: './src/foo',
        },
      },
    };

    expect(() => {
      config.globals = { local: true };
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).not.toThrow(InvalidSchemaError);

    expect(() => {
      config.globals = { local: true, stages: { dev: { vars: { bar: 'baz' } } } };
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).not.toThrow(InvalidSchemaError);

    expect(() => {
      config.globals = { local: true, stages: { dev: { vars: { bar: 'baz' } } }, labels: ['a', 'b', 'c'] };
      dmarkConfigSchemaValidator(config, validatorOpts);
    }).not.toThrow(InvalidSchemaError);
  });
});
