/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { setTimeout } from 'node:timers/promises';
import { SfError } from '@salesforce/core/sfError';
import type { CancelablePromise } from '@inquirer/type';

export type PromptInputs<T> = {
  /** text to display.  Do not include a question mark */
  message: string;
  /** after this many ms, the prompt will time out.  If a default value is provided, the default will be used.  Otherwise the prompt will throw an error */
  ms?: number;
  /**
   * default value to offer to the user.  Will be used if the user does not respond within the timeout period.
   */
  defaultAnswer?: T;
};

export const confirm = async ({
  message,
  ms = 10_000,
  defaultAnswer = false,
}: PromptInputs<boolean>): Promise<boolean> => {
  const promptConfirm = (await import('@inquirer/confirm')).default;
  const answer = promptConfirm({ message, default: defaultAnswer });
  return Promise.race([answer, handleTimeout(answer, ms, defaultAnswer)]);
};

export const secretPrompt = async ({ message, ms = 60_000 }: PromptInputs<string>): Promise<string> => {
  const promptSecret = (await import('@inquirer/password')).default;
  const answer = promptSecret({ message });
  return Promise.race([answer, handleTimeout(answer, ms)]);
};

const handleTimeout = async <T>(answer: CancelablePromise<T>, ms: number, defaultAnswer?: T): Promise<T> =>
  setTimeout(ms, undefined, { ref: false }).then(() => {
    answer.cancel();
    if (typeof defaultAnswer !== 'undefined') return defaultAnswer;
    throw new SfError('Prompt timed out.');
  });

export const prompts = { confirm, secretPrompt };
