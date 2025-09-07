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
import { Messages } from '@salesforce/core/messages';
import { orgApiVersionFlag } from './flags/orgApiVersion.js';
import { optionalHubFlag, optionalOrgFlag, requiredHubFlag, requiredOrgFlag } from './flags/orgFlags.js';

/**
 * Adds an alias for the deprecated sfdx-style "apiversion" and provides a warning if it is used
 * See orgApiVersionFlag for full details
 *
 * @deprecated
 * @example
 * ```
 * import { Flags } from '@salesforce/sf-plugins-core';
 * public static flags = {
 *    'api-version': Flags.orgApiVersion({
 *       char: 'a',
 *       description: 'api version for the org'
 *    }),
 * }
 * ```
 */
export const orgApiVersionFlagWithDeprecations = orgApiVersionFlag({
  aliases: ['apiversion'],
  deprecateAliases: true,
});

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');
/**
 * Use only for commands that maintain sfdx compatibility.
 * Flag will be hidden and will show a warning if used.
 * Flag does *not* set the loglevel
 *
 * @deprecated
 *
 */
export const loglevel = Flags.string({
  hidden: true,
  deprecated: {
    message: messages.getMessage('warning.loglevel'),
  },
});

const deprecatedOrgAliases = {
  aliases: ['targetusername', 'u'],
  deprecateAliases: true,
};

/**
 * @deprecated
 */
export const optionalOrgFlagWithDeprecations = optionalOrgFlag({
  ...deprecatedOrgAliases,
});

/**
 * @deprecated
 */
export const requiredOrgFlagWithDeprecations = requiredOrgFlag({
  ...deprecatedOrgAliases,
  required: true,
});

/**
 * @deprecated
 */
export const requiredHubFlagWithDeprecations = requiredHubFlag({
  aliases: ['targetdevhubusername'],
  deprecateAliases: true,
  required: true,
});

/**
 * @deprecated
 */
export const optionalHubFlagWithDeprecations = optionalHubFlag({
  aliases: ['targetdevhubusername'],
  deprecateAliases: true,
  required: false,
});

export type ArrayWithDeprecationOptions = {
  // prevent invalid options from being passed
  multiple?: true;
  // parse is disallowed because we have to overwrite it
  parse?: undefined;
};
/**
 * @deprecated.  Use `multiple: true` with `delimiter: ','` instead
 */
export const arrayWithDeprecation = Flags.custom<string[], ArrayWithDeprecationOptions>({
  multiple: true,
  delimiter: ',',
});
