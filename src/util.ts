/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Separator, ChoiceOptions, ChoiceBase } from 'inquirer';
import { Dictionary, Nullable, ensureString } from '@salesforce/ts-types';

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
