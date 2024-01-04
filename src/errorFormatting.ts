/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Mode, Messages, envVars } from '@salesforce/core';
import type { ChalkInstance } from 'chalk';
import { StandardColors } from './ux/standardColors.js';
import { SfCommandError } from './types.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');

/**
 * Format errors and actions for human consumption. Adds 'Error (<ErrorCode>):',
 * When there are actions, we add 'Try this:' in blue
 * followed by each action in red on its own line.
 * If Error.code is present it is output last in parentheses
 *
 * @returns {string} Returns decorated messages.
 */

/**
 * Utility function to format actions lines
 *
 * @param actions
 * @param options
 * @private
 */
export const formatActions = (
  actions: string[],
  options: { actionColor: ChalkInstance } = { actionColor: StandardColors.info }
): string[] =>
  actions.length
    ? [
        `\n${StandardColors.info(messages.getMessage('actions.tryThis'))}\n`,
        ...actions.map((a) => `${options.actionColor(a)}`),
      ]
    : [];

export const formatError = (error: SfCommandError): string =>
  [
    `${formatErrorPrefix(error)} ${error.message}`,
    ...formatActions(error.actions ?? []),
    error.stack && envVars.getString('SF_ENV') === Mode.DEVELOPMENT
      ? StandardColors.info(`\n*** Internal Diagnostic ***\n\n${error.stack}\n******\n`)
      : [],
  ].join('\n');

const formatErrorPrefix = (error: SfCommandError): string =>
  `${StandardColors.error(messages.getMessage('error.prefix', [formatErrorCode(error)]))}`;

const formatErrorCode = (error: SfCommandError): string =>
  typeof error.code === 'string' || typeof error.code === 'number' ? ` (${error.code})` : '';
