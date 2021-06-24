/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Separator, ChoiceOptions, ChoiceBase } from 'inquirer';
import { Dictionary, Nullable, ensureString } from '@salesforce/ts-types';

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
      ) + (padForCheckbox ? 3 : 0)
  );

  const choicesOptions: ChoiceBase[] = [
    // Pad an extra 2 to account for checkbox
    new Separator(columnEntries.map(([, value], index) => value?.padEnd(columnLengths[index] + 2, ' ')).join('')),
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
