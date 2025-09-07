/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { inspect } from 'node:util';
import type { Ansis } from 'ansis';
import { Mode, Messages, envVars, SfError } from '@salesforce/core';
import { AnyJson, ensureString, isAnyJson } from '@salesforce/ts-types';
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
    formatMultipleErrorMessages(error),
    ...formatActions(error.actions ?? []),
    error.stack && envVars.getString('SF_ENV') === Mode.DEVELOPMENT
      ? StandardColors.info(`\n*** Internal Diagnostic ***\n\n${inspect(error)}\n******\n`)
      : [],
  ].join('\n');

const formatErrorPrefix = (error: SfCommandError): string =>
  `${StandardColors.error(messages.getMessage('error.prefix', [formatErrorCode(error)]))}`;

const formatErrorCode = (error: SfCommandError): string =>
  typeof error.code === 'string' || typeof error.code === 'number' ? ` (${error.code})` : '';

type JsforceApiError = {
  errorCode: string;
  message?: AnyJson;
};

const isJsforceApiError = (item: AnyJson): item is JsforceApiError =>
  typeof item === 'object' && item !== null && !Array.isArray(item) && ('errorCode' in item || 'message' in item);

const formatMultipleErrorMessages = (error: SfCommandError): string => {
  if (error.code === 'MULTIPLE_API_ERRORS' && error.cause) {
    const errorData = getErrorData(error.cause);
    if (errorData && Array.isArray(errorData) && errorData.length > 0) {
      const errors = errorData.filter(isJsforceApiError).map((d) => ({
        errorCode: d.errorCode,
        message: ensureString(d.message ?? ''),
      }));

      const ux = new Ux();
      return ux.makeTable({
        data: errors,
        columns: [
          { key: 'errorCode', name: 'Error Code' },
          { key: 'message', name: 'Message' },
        ],
      });
    }
  }
  return '';
};

/**
 * Utility function to extract error data from an error object.
 * Recursively traverses the error chain to find the first error that contains data.
 * Returns undefined if no error in the chain contains data or if the input is not an Error/SfError.
 *
 * This is used in the top-level catch in sfCommand for deeply-nested error data.
 *
 * @param error - The error object to extract data from
 * @returns The error data if found, undefined otherwise
 */
const getErrorData = (error: unknown): AnyJson | undefined => {
  if (!(error instanceof Error || error instanceof SfError)) return undefined;

  if ('data' in error && error.data && isAnyJson(error.data)) {
    return error.data;
  } else if (error.cause) {
    return getErrorData(error.cause);
  } else {
    return undefined;
  }
};
