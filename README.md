[![NPM](https://img.shields.io/npm/v/@salesforce/sf-plugins-core.svg)](https://www.npmjs.com/package/@salesforce/sf-plugins-core)

# Description

The @salesforce/sf-pluins-core provides utilities for writing [sf](https://github.com/salesforcecli/cli) plugins.

## SfCommand Abstract Class

The SfCommand abstract class extends @oclif/command class and adds useful extensions to ease the development of commands for use in the Salesforce Unified CLI.

- SfCommand takes a generic type that defines the success JSON result
- Enable the json flag support by default
- Provides functions that help place success messages, warnings and errors into the correct location in JSON results
- Enables additional help sections to the standard oclif command help output

## Sf Hooks Utilities

### SfHooks Interface

Interface that defines the well known Unified CLI command hooks. See [@salesforce/plugin-deploy-retrieve-metadataA#src/hooks/deploy.ts](https://github.com/salesforcecli/plugin-deploy-retrieve-metadata/blob/main/src/hooks/deploy.ts) as an example implementation.

### SfHook Class

Class that provides a static method to run a well known hook.

## Deployer Interface

Interface for deploying Deployables. See [@salesforce/plugin-deploy-retrieve-metadata#src/utils/metadataDeployer.ts](https://github.com/salesforcecli/plugin-deploy-retrieve-metadata/blob/main/src/utils/metadataDeployer.ts) as an example implementation.

## Deauthorizer Abstract Class

The Deauthorizer is an abstract class that is used to implement a concrete implementations of deauthorizing an environment.

## Spinner Class

This class is a light wrapper around cli.action that allows us to automatically suppress any actions if `--json` flag is present.

## Prompter Class

A general purpose class that prompts a user for information. See [inquirer NPM Module](https://www.npmjs.com/package/inquirer) for more information.

## Flags

Flags is a convenience reference to [@oclif/core#Flags](https://github.com/oclif/core/blob/main/src/flags.ts)
