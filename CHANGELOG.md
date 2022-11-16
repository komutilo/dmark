# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.3] - 2022-11-16
### Added
- --delete-lock cli flag added to delete the ".terraform.lock.hcl" in the currents stacks of the run (for each stage call).

## [1.0.2] - 2022-11-13
### Added
- Log a message if the stage is ignored.

## [1.0.1] - 2022-10-10
### Fixes
- removing promisify-child-process from devDependecies to dependencies.


## [1.0.0] - 2022-10-10
### Added
- Dmark binary entrypoint.
- Dmark config schema validator.
- Custom CLI helper.
- Lint using ESLint.
- Initial unit tests with Jest.
- Types generation from JSDoc comments using tsc.