const path = require('path');

const jestConfig = {
  rootDir: path.join(__dirname, '..'),
  testPathIgnorePatterns: ['/node_modules/', '/scripts/'],
  verbose: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js'],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './coverage',
      outputName: 'junit.xml',
    }],
  ],
  maxWorkers: 1,
};

module.exports = jestConfig;
