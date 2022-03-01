/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Flags } from '@oclif/core';
import { Messages, Org, ConfigAggregator } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');

const maybeGetOrg = async (input?: string): Promise<Org | undefined> => Org.create({ aliasOrUsername: input });
const getOrgOrThrow = async (input?: string): Promise<Org> => {
  const org = await maybeGetOrg(input);
  if (!org) {
    throw messages.createError('errors.NoDefaultEnv');
  }
  return org;
};

const getHubOrThrow = async (aliasOrUsername?: string): Promise<Org> => {
  if (!aliasOrUsername) {
    // check config for a default
    const config = await ConfigAggregator.create();
    aliasOrUsername = config.getInfo('defaultdevhubusername')?.value as string;
    if (!aliasOrUsername) {
      throw messages.createError('errors.NoDefaultDevHub', [aliasOrUsername]);
    }
  }
  const org = await Org.create({ aliasOrUsername });
  // check the synchronous, cached version and only use "determine" if we didn't get a positive result
  if (!org.isDevHubOrg() || !(await org.determineIfDevHubOrg())) {
    throw messages.createError('errors.NotADevHub', [aliasOrUsername]);
  }
  return org;
};

/**
 * An optional org specified by username or alias
 * Will default to the default org if one is not specified.
 * Will not throw if the specified org and default do not exist
 *
 * @example
 * import { SfCommand, optionalOrgFlag } from '@salesforce/sf-plugins-core';
 * public static flags = {
 *     // setting length or prefix
 *    'target-org': optionalOrgFlag(),
 *    // adding properties
 *    'flag2': optionalOrgFlag()({
 *        required: true,
 *        description: 'flag2 description',
 *     }),
 * }
 */
export const optionalOrgFlag = Flags.build<Org | undefined>({
  char: 'e',
  parse: async (input: string | undefined) => await maybeGetOrg(input),
  default: async () => await maybeGetOrg(),
});

/**
 * An required org, specified by username or alias
 * Will throw if the specified org default do not exist
 * Will default to the default org if one is not specified.
 * Will throw if no default org exists and none is specified
 *
 * @example
 * import { SfCommand, requiredOrgFlag } from '@salesforce/sf-plugins-core';
 * public static flags = {
 *     // setting length or prefix
 *    'target-org': requiredOrgFlag(),
 *    // adding properties
 *    'flag2': requiredOrgFlag({
 *        required: true,
 *        description: 'flag2 description',
 *        char: 'o'
 *     }),
 * }
 */
export const requiredOrgFlag = Flags.build<Org>({
  char: 'e',
  parse: async (input: string | undefined) => await getOrgOrThrow(input),
  default: async () => await getOrgOrThrow(undefined),
});

/**
 * An required org that is a devHub
 * Will throw if the specified org does not exist
 * Will default to the default dev hub if one is not specified
 * Will throw if no default deb hub exists and none is specified
 *
 * @example
 * import { SfCommand, requiredOrgFlag } from '@salesforce/sf-plugins-core';
 * public static flags = {
 *     // setting length or prefix
 *    'target-org': requiredHubFlag(),
 *    // adding properties
 *    'flag2': requiredHubFlag({
 *        required: true,
 *        description: 'flag2 description',
 *        char: 'h'
 *     }),
 * }
 */
export const requiredHubFlag = Flags.build<Org>({
  char: 'v',
  parse: async (input: string | undefined) => await getHubOrThrow(input),
  default: async () => await getHubOrThrow(undefined),
});
