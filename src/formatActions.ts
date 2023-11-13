/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as chalk from 'chalk';
import { StandardColors, messages } from './sfCommand';

export const formatActions = (
  actions: string[] = [],
  options: { actionColor: chalk.Chalk } = { actionColor: StandardColors.info }
): string[] =>
  actions.length
    ? [
        `\n${StandardColors.info(messages.getMessage('actions.tryThis'))}\n`,
        ...actions.map((action) => `${options.actionColor(action)}`),
      ]
    : [];
