/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Separator, ChoiceOptions, ChoiceBase } from 'inquirer';
import { Dictionary, Nullable, ensureString } from '@salesforce/ts-types';
import { HelpSection } from '@oclif/core';
import { ORG_CONFIG_ALLOWED_PROPERTIES, OrgConfigProperties } from '@salesforce/core';
import { SFDX_ALLOWED_PROPERTIES, SfdxPropertyKeys } from '@salesforce/core';
import { EnvironmentVariable, SUPPORTED_ENV_VARS } from '@salesforce/core';

/**
 * Generate a formatted table for list and checkbox prompts
 *
 * Each option should contain the same keys as specified in columns.
 * For example,
 * const columns = { name: 'Name', type: 'Type', path: 'Path' };
 * const options = [{ name: 'foo', type: 'org', path: '/path/to/foo/' }];
 * generateTableChoices(columns, options);
 */
export function generateTableChoices<T>(
  columns: Dictionary<string>,
  choices: Array<Dictionary<Nullable<string> | T>>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  padForCheckbox = true
): ChoiceBase[] {
  const columnEntries = Object.entries(columns);
  const columnLengths = columnEntries.map(
    ([key, value]) =>
      Math.max(
        ensureString(value).length,
        ...choices.map(
          (option) =>
            ensureString(option[key], `Type ${typeof option[key]} for ${key} in ${Object.keys(option).join(', ')}`)
              .length
        )
      ) + 1
  );

  const choicesOptions: ChoiceBase[] = [
    new Separator(
      `${padForCheckbox ? ' '.repeat(2) : ''}${columnEntries
        .map(([, value], index) => value?.padEnd(columnLengths[index], ' '))
        .join('')}`
    ),
  ];

  for (const meta of choices) {
    const name = columnEntries
      .map(([key], index) => ensureString(meta[key]).padEnd(columnLengths[index], ' '))
      .join('');
    const choice: ChoiceOptions = { name, value: meta.value, short: ensureString(meta.name) };
    choicesOptions.push(choice);
  }

  return choicesOptions;
}

/**
 * Function to build a help section for command help.
 * Takes a string to be used as section header text and an array of enums
 * that identify the variable or property to be included in the help
 * body.
 *
 * @param header
 * @param vars
 */
export function toHelpSection(
  header: string,
  ...vars: Array<OrgConfigProperties | SfdxPropertyKeys | EnvironmentVariable>
): HelpSection {
  const body = vars
    .map((v) => {
      const orgConfig = ORG_CONFIG_ALLOWED_PROPERTIES.find(({ key }) => {
        return key === v;
      });
      if (orgConfig) {
        return { name: orgConfig.key, description: orgConfig.description };
      }
      const sfdxProperty = SFDX_ALLOWED_PROPERTIES.find(({ key }) => key === v);
      if (sfdxProperty) {
        return { name: sfdxProperty.key.valueOf(), description: sfdxProperty.description };
      }
      const envVar = Object.entries(SUPPORTED_ENV_VARS).find(([k]) => k === v);

      if (envVar) {
        const [eKey, data] = envVar;
        return { name: eKey, description: data.description };
      }
      return undefined;
    })
    .filter((b) => b);
  return { header, body } as HelpSection;
}
