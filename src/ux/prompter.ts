/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { prompt, QuestionCollection, Separator, ChoiceOptions, ChoiceBase } from 'inquirer';
import { Dictionary, Nullable, ensureString } from '@salesforce/ts-types';
import { CliUx } from '@oclif/core';

export class Prompter {
  /**
   * Prompt user for information. See https://www.npmjs.com/package/inquirer for more.
   */
  public async prompt<T = Prompter.Answers>(questions: Prompter.Questions<T>, initialAnswers?: Partial<T>): Promise<T> {
    const answers = await prompt<T>(questions, initialAnswers);
    return answers;
  }

  /**
   * Prompt user for information with a timeout (in milliseconds). See https://www.npmjs.com/package/inquirer for more.
   */
  public async timedPrompt<T = Prompter.Answers>(
    questions: Prompter.Questions<T>,
    ms = 10000,
    initialAnswers?: Partial<T>
  ): Promise<T> {
    let id: NodeJS.Timeout;
    const thePrompt = prompt(questions, initialAnswers);
    const timeout = new Promise((_, reject) => {
      id = setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        thePrompt.ui['activePrompt'].done();
        CliUx.ux.log();
        reject(new Error(`Timed out after ${ms} ms.`));
      }, ms).unref();
    });

    return Promise.race([timeout, thePrompt]).then((result) => {
      clearTimeout(id);
      return result as T;
    });
  }
}

export namespace Prompter {
  export type Answers<T = Record<string, unknown>> = T & Record<string, unknown>;
  export type Questions<T> = QuestionCollection<T>;
}

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
