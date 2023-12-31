[![NPM](https://img.shields.io/npm/v/@salesforce/sf-plugins-core.svg)](https://www.npmjs.com/package/@salesforce/sf-plugins-core)

# Description

The @salesforce/sf-plugins-core provides utilities for writing [sf](https://github.com/salesforcecli/cli) plugins.

Docs: [https://salesforcecli.github.io/sf-plugins-core](https://salesforcecli.github.io/sf-plugins-core)

## SfCommand Abstract Class

The SfCommand abstract class extends [@oclif/core's Command class](https://github.com/oclif/core/blob/main/src/command.ts) for examples of how to build a definition.
) class and adds useful extensions to ease the development of commands for use in the Salesforce Unified CLI.

- SfCommand takes a generic type that defines the success JSON result
- Enable the json flag support by default
- Provides functions that help place success messages, warnings and errors into the correct location in JSON results
- Enables additional help sections to the standard oclif command help output
- Provides access to the [cli-ux cli actions](https://github.com/oclif/cli-ux#cliaction). This avoids having to import that interface from cli-ux and manually handling the `--json` flag.

## Prompter Class

A general purpose class that prompts a user for information. See [inquirer NPM Module](https://www.npmjs.com/package/inquirer) for more information.

## Flags

Flags is a convenience reference to [@oclif/core#Flags](https://github.com/oclif/core/blob/main/src/flags.ts)

### Specialty Flags

These flags can be imported into a command and used like any other flag. See code examples in the links

- [orgApiVersionFlag](src/flags/orgApiVersion.ts)
  - specifies a Salesforce API version.
  - reads from Config (if available)
  - validates version is still active
  - warns if version if deprecated
- [requiredOrgFlag](src/flags/orgFlags.ts)
  - accepts a username or alias
  - aware of configuration defaults
  - throws if org or default doesn't exist or can't be found
- [optionalOrgFlag](src/flags/orgFlags.ts)
  - accepts a username or alias
  - aware of configuration defaults
  - might be undefined if an org isn't found
- [requiredHubFlag](src/flags/orgFlags.ts)
  - accepts a username or alias
  - aware of configuration defaults
  - throws if org or default doesn't exist or can't be found
  - throws if an org is found but is not a dev hub
- [durationFlag](src/flags/duration.ts)
  - specify a unit
  - optionally specify a min, max, and defaultValue
  - returns a [Duration](https://github.com/forcedotcom/kit/blob/main/src/duration.ts)
  - can be undefined if you don't set the default
- [salesforceIdFlag](src/flags/salesforceId.ts)
  - validates that IDs are valid salesforce ID
  - optionally restrict to 15/18 char
  - optionally require it to be begin with a certain prefix

### Unit Test Helpers

Want to verify SfCommand Ux behavior (warnings, tables, spinners, prompts)? Check out the functions in `stubUx``.
