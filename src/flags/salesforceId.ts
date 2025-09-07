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
import { Flags } from '@oclif/core';
import { Messages, validateSalesforceId } from '@salesforce/core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');

export type IdFlagConfig = {
  /**
   * Can specify if the version must be 15 or 18 characters long or 'both'. Leave blank to allow either 15 or 18.
   */
  length?: 15 | 18 | 'both';
  /**
   * If the ID belongs to a certain sobject type, specify the 3 character prefix.
   */
  startsWith?: string;
};

/**
 * Id flag with built-in validation.  Short character is `i`
 *
 * @example
 *
 * ```
 * import { Flags } from '@salesforce/sf-plugins-core';
 * public static flags = {
 *     // set length or prefix
 *    'flag-name': salesforceId({ length: 15, startsWith: '00D' }),
 *    // add flag properties
 *    'flag2': salesforceId({
 *        required: true,
 *        description: 'flag2 description',
 *     }),
 *    // override the character i
 *    'flag3': salesforceId({
 *        char: 'j',
 *     }),
 * }
 * ```
 */
export const salesforceIdFlag = Flags.custom<string, IdFlagConfig>({
  // eslint-disable-next-line @typescript-eslint/require-await
  parse: async (input, _ctx, opts) => validate(input, opts),
  char: 'i',
});

const validate = (input: string, config?: IdFlagConfig): string => {
  const { length, startsWith } = config ?? {};

  // If the flag doesn't specify a length or specifies "both", then let it accept both 15 or 18.
  const allowedIdLength = !length || length === 'both' ? [15, 18] : [length];

  if (!allowedIdLength.includes(input.length)) {
    throw messages.createError('errors.InvalidIdLength', [
      allowedIdLength.join(` ${messages.getMessage('errors.InvalidIdLength.or')} `),
    ]);
  }
  if (!validateSalesforceId(input)) {
    throw messages.createError('errors.InvalidId');
  }
  if (startsWith && !input.startsWith(startsWith)) {
    throw messages.createError('errors.InvalidPrefix', [startsWith]);
  }
  return input;
};
