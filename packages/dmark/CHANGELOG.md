# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.1.2] - 2024-08-??
### Added
- `esbuild` dev module to generate a bundle.
- `postject` dev module to inject blob file into node executable in the binary release.

### Fixes
- Accept string as an input in the `args` parameter in the `cmdTask` function.

## [1.1.1] - 2024-07-30
### Fixes
- Fixed dependabot audit alert. https://github.com/komutilo/dmark/security/dependabot/6

## [1.1.0] - 2024-06-06
### Added
- Added OpenTofu as an option to run the commands beyond the default terraform.
- Added the `runner` field in the config file.

## [1.0.4] - 2022-11-16
### Fixes
- Fix to use correctly the function `[].concat([])` in dmark module, specially for apply the rest.

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
