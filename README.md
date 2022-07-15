[![NPM](https://img.shields.io/npm/v/@salesforce/sf-plugins-core.svg)](https://www.npmjs.com/package/@salesforce/sf-plugins-core)

# Description

The @salesforce/sf-plugins-core provides utilities for writing [sf](https://github.com/salesforcecli/cli) plugins.

## SfCommand Abstract Class

The SfCommand abstract class extends [@oclif/core's Command class](https://github.com/oclif/core/blob/main/src/command.ts) and adds useful extensions to ease the development of commands for use in the Salesforce Unified CLI.

- SfCommand takes a generic type that defines the success JSON result
- It enables the --json flag by default, see the [oclif docs](https://oclif.io/docs/json) for more info.
- Provides functions that help place success messages, warnings and errors into the correct location in JSON results
- Enables additional help sections to the standard oclif command help output
- Provides access to the [cli-ux cli actions](https://github.com/oclif/cli-ux#cliaction) via the public property `spinner` in SfCommand. This avoids having to import that interface from cli-ux.

## Sf Hooks

Interface that defines the well known Unified CLI command hooks.
SfHooks takes advantage of the [oclif hooks framework](https://oclif.io/docs/hooks), which provides a set of predefined events and the provides ability to define your own.

A hook has a name, say `sf:deploy` and to participate in the hook's run call, one creates a hook consumer, that registers itself using the name `sf:deploy`.
There can be more than one hook registered with the same name and when the hook is "run", oclif hook will run each registered hook consumer, collect all results and return those results to the caller.

- See [oclif hooks API docs](https://oclif.io/docs/hooks.ts) for a general description of hooks.
- See [SfHooks](src/hooks.ts) for current hook definitions available in Unified CLI.
- See Command [Deploy](https://github.com/salesforcecli/plugin-deploy-retrieve/blob/main/src/commands/deploy.ts) for and example of how to run a hook (search for [SfHook](https://github.com/salesforcecli/plugin-deploy-retrieve/blob/main/src/commands/deploy.ts).run in linked file).
- See [@salesforce/plugin-deploy-retrieve-metadataA#src/hooks/deploy.ts](https://github.com/salesforcecli/plugin-deploy-retrieve-metadata/blob/main/src/hooks/deploy.ts) as an example implementation of a hook consumer.

## Deployer Interface

Interface for deploying Deployables. See [@salesforce/plugin-deploy-retrieve-metadata#src/utils/metadataDeployer.ts](https://github.com/salesforcecli/plugin-deploy-retrieve-metadata/blob/main/src/utils/metadataDeployer.ts) as an example implementation.

## Deauthorizer Abstract Class

The Deauthorizer is an abstract class that is used to implement a concrete implementations of deauthorizing an environment.

## Prompter Class

A general purpose class that prompts a user for information. See [inquirer NPM Module](https://www.npmjs.com/package/inquirer) for more information.

## Flags

Flags is a convenience reference to [@oclif/core#Flags](https://github.com/oclif/core/blob/main/src/flags.ts)

### Specialty Flags

These flags can be imported into a command and used like any other flag. See code examples in the links

- [orgApiVersionFlag](src/flags/apiVersion.ts)
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
