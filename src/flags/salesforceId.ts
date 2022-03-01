/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Flags, Interfaces } from '@oclif/core';
import { OptionFlagProps } from '@oclif/core/lib/interfaces/parser';
import { Messages, sfdc } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');

interface IdFlagConfig extends Partial<OptionFlagProps> {
  /**
   * Can specify if the version must be 15 or 18 characters long.  Leave blank to allow either 15 or 18.
   */
  length?: 15 | 18;
  /**
   * If the ID belongs to a certain sobject type, specify the 3 character prefix.
   */
  startsWith?: string;
}

/**
 * Id flag with built-in validation.  Short character is `i`
 *
 * @example
 * import { SfCommand, salesforceIdFlag } from '@salesforce/sf-plugins-core';
 * public static flags = {
 *     // set length or prefix
 *    'flag-name': salesforceIdFlag({ length: 15, startsWith: '00D' }),
 *    // add flag properties
 *    'flag2': salesforceIdFlag({
 *        required: true,
 *        description: 'flag2 description',
 *     }),
 *    // override the character i
 *    'flag3': salesforceIdFlag({
 *        char: 'j',
 *     }),
 * }
 */
export const salesforceIdFlag = (inputs: IdFlagConfig = {}): Interfaces.OptionFlag<string | undefined> => {
  const { length, startsWith, ...baseProps } = inputs;
  return Flags.build<string>({
    char: 'i',
    ...baseProps,
    parse: async (input: string) => validate(input, { length, startsWith }),
  })();
};

const validate = (input: string, config?: IdFlagConfig): string => {
  const { length, startsWith } = config || {};
  if (length && input.length !== length) {
    throw messages.createError('errors.InvalidIdLength', [length]);
  }
  if (!length && ![15, 18].includes(input.length)) {
    throw messages.createError('errors.InvalidIdLength', ['15 or 18']);
  }
  if (!sfdc.validateSalesforceId(input)) {
    throw messages.createError('errors.InvalidId');
  }
  if (startsWith && !input.startsWith(startsWith)) {
    throw messages.createError('errors.InvalidPrefix', [startsWith]);
  }
  return input;
};
