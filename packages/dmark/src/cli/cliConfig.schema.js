const cliConfigSchema = {
  validFlags: [
    {
      name:
      {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      shortCut: {
        type: String,
      },
    },
  ],
  validOptions: [
    {
      name:
      {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      shortCut: {
        type: String,
      },
    },
  ],
};

module.exports = { cliConfigSchema };
