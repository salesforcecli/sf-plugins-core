/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as chalk from 'chalk';
import { StandardColors, messages } from './sfCommand';

export const formatActions = (
  actions: string[],
  options: { actionColor: chalk.Chalk } = { actionColor: StandardColors.info }
): string[] => {
  const colorizedArgs: string[] = [];
  // Format any actions.
  if (actions?.length) {
    colorizedArgs.push(`\n${StandardColors.info(messages.getMessage('actions.tryThis'))}\n`);
    actions.forEach((action) => {
      colorizedArgs.push(`${options.actionColor(action)}`);
    });
  }
  return colorizedArgs;
};
