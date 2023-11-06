/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Mode, SfError, Messages, envVars } from '@salesforce/core';
import { SfCommand, StandardColors } from './sfCommand';
import { formatActions } from './formatActions';

/**
 *
 * Takes an error and returns an exit code.
 * Logic:
 * - If it looks like a gack, use that code (20)
 * - If it looks like a TypeError, use that code (10)
 * - use the exitCode if it is a number
 * - use the code if it is a number, or 1 if it is present not a number
 * - use the process exitCode
 * - default to 1
 */
export const computeErrorCode = (e: Error | SfError | SfCommand.Error): number => {
  // regardless of the exitCode, we'll set gacks and TypeError to a specific exit code
  if (errorIsGack(e)) {
    return 20;
  }

  if (errorIsTypeError(e)) {
    return 10;
  }

  if ('exitCode' in e && typeof e.exitCode === 'number') {
    return e.exitCode;
  }

  if ('code' in e) {
    return typeof e.code !== 'number' ? 1 : e.code;
  }

  return process.exitCode ?? 1;
};

/** identifies gacks via regex.  Searches the error message, stack, and recursively checks the cause chain */
export const errorIsGack = (error: Error | SfError): boolean => {
  /** see test for samples  */
  const gackRegex = /\d{9,}-\d{3,} \(-?\d{7,}\)/;
  return (
    gackRegex.test(error.message) ||
    (typeof error.stack === 'string' && gackRegex.test(error.stack)) ||
    // recurse down through the error cause tree to find a gack
    ('cause' in error && error.cause instanceof Error && errorIsGack(error.cause))
  );
};

/** identifies TypeError.  Searches the error message, stack, and recursively checks the cause chain */
export const errorIsTypeError = (error: Error | SfError): boolean =>
  error instanceof TypeError ||
  error.name === 'TypeError' ||
  error.message.includes('TypeError') ||
  Boolean(error.stack?.includes('TypeError')) ||
  ('cause' in error && error.cause instanceof Error && errorIsTypeError(error.cause));

/**
 * Format errors and actions for human consumption. Adds 'Error (<ErrorCode>):',
 * When there are actions, we add 'Try this:' in blue
 * followed by each action in red on its own line.
 * If Error.code is present it is output last in parentheses
 *
 * @returns {string} Returns decorated messages.
 */
export const formatError = (error: SfCommand.Error): string => {
  Messages.importMessagesDirectory(__dirname);
  const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');

  const errorCode = typeof error.code === 'string' || typeof error.code === 'number' ? ` (${error.code})` : '';
  const errorPrefix = `${StandardColors.error(messages.getMessage('error.prefix', [errorCode]))}`;
  return [`${errorPrefix} ${error.message}`]
    .concat(formatActions(error.actions))
    .concat(
      error.stack && envVars.getString(SfCommand.SF_ENV) === Mode.DEVELOPMENT
        ? [`\n*** Internal Diagnostic ***\n\n${error.stack}\n******\n`]
        : []
    )
    .join('\n');
};
