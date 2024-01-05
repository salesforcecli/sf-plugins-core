# Migrating from v5 to v6

## ESM

v6 is ESM-only, which can't be consumed by plugins written in cjs. Salesforce-owned plugins are ESM now and you can use them as a guide for the necessary changes.

## Prompts

This library uses [`inquirer`](https://github.com/SBoudrias/Inquirer.js) for interactivity. Inquirer made some large changes, including its own ESM rewrite. To take advantage of its improved performance and smaller dependency, we've upgraded.

The API is completely different, resulting in changes to sf-plugins-core. The new philopsophy is

1. provide limited, simplified prompts for common use cases
2. plugins that need more advanced propting should import the parts of inquirer that they need

### Changes

The `Prompter` class is removed.

SfCommand contains two prompt methods

1. `confirm` provides boolean confirmation prompts
2. `secretPrompt` takes masked string input from the user

Unlike the inquirer base prompts (`confirm` and `password`, respectively) these have a built-in default timeout. Both take an object parameter that lets you change the timeout (confirm previously took a series of parameters)

These methods are also built into the `stubPrompter` method for simplified test stubbing.

If your command relies heavily on the old inquirer/prompt structure, it's possible to import that as a dependency.

### Reorganized exports

There are more "standalone" exports available. See package.json#exports for options that don't invole importing the entire library.

Also removed is the "barrel of Ux". Import what you need.

## Breaking type changes

### SfCommand.project

Project was typed as an `SfProject` but could be undefined when `requiresProject` wasn't set to true on a command. It's now typed as `SfProject | undefined`. If your command sets `requiresProject = true` you can safely assert `this.project!`.

### SfCommand.catch

Catch was previously typed to return an error, but it always threw the error. It's now properly typed as `never`. If you extended `catch`, your method should also return `never`.
