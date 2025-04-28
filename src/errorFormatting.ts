/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { inspect } from 'node:util';
import type { Ansis } from 'ansis';
import { Mode, Messages, envVars } from '@salesforce/core';
import { StandardColors } from './ux/standardColors.js';
import { SfCommandError } from './SfCommandError.js';
import { Ux } from './ux/ux.js';

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
  options: { actionColor: Ansis } = { actionColor: StandardColors.info }
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
    ...formatMultipleErrorMessages(error),
    ...formatActions(error.actions ?? []),
    error.stack && envVars.getString('SF_ENV') === Mode.DEVELOPMENT
      ? StandardColors.info(`\n*** Internal Diagnostic ***\n\n${inspect(error)}\n******\n`)
      : [],
  ].join('\n');

const formatErrorPrefix = (error: SfCommandError): string =>
  `${StandardColors.error(messages.getMessage('error.prefix', [formatErrorCode(error)]))}`;

const formatErrorCode = (error: SfCommandError): string =>
  typeof error.code === 'string' || typeof error.code === 'number' ? ` (${error.code})` : '';

const formatMultipleErrorMessages = (error: SfCommandError): string[] => {
  if (!error.data || !Array.isArray(error.data) || error.data.length === 0) {
    return [];
  }

  const errorData = error.data.map((d) => ({
    errorCode: (d as { errorCode: string }).errorCode || '',
    message: (d as { message: string }).message || '',
  }));

  const ux = new Ux();
  return [
    ux.makeTable({
      data: errorData,
      columns: [
        { key: 'errorCode', name: 'Error Code' },
        { key: 'message', name: 'Message' },
      ],
    }),
  ];
};
