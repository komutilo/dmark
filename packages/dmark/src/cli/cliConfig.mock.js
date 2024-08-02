const cliConfig = {
  validFlags: [
    {
      name: 'foo-flag',
      description: 'A foo flag.',
    },
    {
      name: 'bar-flag',
      shortCut: 'b',
      description: 'A bar flag.',
    },
    {
      name: 'baz-flag',
      shortCut: 'z',
      description: 'A baz flag.',
    },
  ], validOptions: [
    {
      name: '--foo-opt',
      description: 'A foo option.',
    },
    {
      name: 'bar-opt',
      shortCut: 'a',
      description: 'A bar option.',
    },
    {
      name: 'baz-opt',
      description: 'A baz option.',
    },
  ],
};

module.exports = { cliConfig };
