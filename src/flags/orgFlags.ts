/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Flags } from '@oclif/core';
import { Messages, Org, ConfigAggregator, OrgConfigProperties } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');

const maybeGetOrg = async (input?: string): Promise<Org | undefined> => {
  try {
    return await Org.create({ aliasOrUsername: input });
  } catch (e) {
    if (!input) {
      return undefined;
    } else {
      throw e;
    }
  }
};

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
    aliasOrUsername = config.getInfo(OrgConfigProperties.TARGET_DEV_HUB)?.value as string;
    if (!aliasOrUsername) {
      throw messages.createError('errors.NoDefaultDevHub');
    }
  }
  const org = await Org.create({ aliasOrUsername });
  if (await org.determineIfDevHubOrg()) {
    return org;
  }
  throw messages.createError('errors.NotADevHub', [aliasOrUsername]);
};

/**
 * An optional org specified by username or alias
 * Will default to the default org if one is not specified.
 * Will not throw if the specified org and default do not exist
 *
 * @example
 * import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
 * public static flags = {
 *     // setting length or prefix
 *    'target-org': Flags.optionalOrg(),
 *    // adding properties
 *    'flag2': Flags.optionalOrg({
 *        required: true,
 *        description: 'flag2 description',
 *     }),
 * }
 */
export const optionalOrgFlag = Flags.build<Org | undefined>({
  char: 'e',
  parse: async (input: string | undefined) => await maybeGetOrg(input),
  default: async () => await maybeGetOrg(),
  defaultHelp: async () => (await maybeGetOrg())?.getUsername(),
});

/**
 * A required org, specified by username or alias
 * Will throw if the specified org default do not exist
 * Will default to the default org if one is not specified.
 * Will throw if no default org exists and none is specified
 *
 * @example
 * import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
 * public static flags = {
 *     // setting length or prefix
 *    'target-org': Flags.requiredOrg(),
 *    // adding properties
 *    'flag2': Flags.requiredOrg({
 *        required: true,
 *        description: 'flag2 description',
 *        char: 'o'
 *     }),
 * }
 */
export const requiredOrgFlag = Flags.build<Org>({
  char: 'e',
  parse: async (input: string | undefined) => await getOrgOrThrow(input),
  default: async () => await getOrgOrThrow(),
  defaultHelp: async () => (await getOrgOrThrow())?.getUsername(),
});

/**
 * A required org that is a devHub
 * Will throw if the specified org does not exist
 * Will default to the default dev hub if one is not specified
 * Will throw if no default deb hub exists and none is specified
 *
 * @example
 * import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
 * public static flags = {
 *     // setting length or prefix
 *    'target-org': requiredHub(),
 *    // adding properties
 *    'flag2': requiredHub({
 *        required: true,
 *        description: 'flag2 description',
 *        char: 'h'
 *     }),
 * }
 */
export const requiredHubFlag = Flags.build<Org>({
  char: 'v',
  parse: async (input: string | undefined) => await getHubOrThrow(input),
  default: async () => await getHubOrThrow(),
  defaultHelp: async () => (await getHubOrThrow())?.getUsername(),
});
