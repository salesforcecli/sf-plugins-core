/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { prompt, QuestionCollection } from 'inquirer';

export class Prompter {
  /**
   * Prompt user for information. See https://www.npmjs.com/package/inquirer for more.
   */
  public async prompt<T = Prompter.Answers>(questions: QuestionCollection<T>, initialAnswers?: Partial<T>): Promise<T> {
    const answers = await prompt<T>(questions, initialAnswers);
    return answers;
  }
}

export namespace Prompter {
  export type Answers<T = Record<string, unknown>> = T & Record<string, unknown>;
}
