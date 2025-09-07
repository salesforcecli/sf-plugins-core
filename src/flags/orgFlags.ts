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
import { ConfigAggregator, Messages, Org, OrgConfigProperties } from '@salesforce/core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');

export async function maybeGetOrg(input: string): Promise<Org>;
export async function maybeGetOrg(input: undefined): Promise<undefined>;
export async function maybeGetOrg(input?: string | undefined): Promise<Org | undefined>;
export async function maybeGetOrg(input?: string | undefined): Promise<Org | undefined> {
  try {
    return await Org.create({ aliasOrUsername: input });
  } catch (e) {
    if (!input) {
      return undefined;
    } else {
      throw e;
    }
  }
}

export const maybeGetHub = async (input?: string): Promise<Org | undefined> => {
  let org: Org | undefined;
  // user provided input, verify the org exits
  if (input) {
    org = await getOrgOrThrow(input);
  } else {
    // no input, check config for a default
    const aliasOrUsername = await getDefaultHub(false);
    // if there is a default, verify the org exists
    if (aliasOrUsername) {
      org = await getOrgOrThrow(aliasOrUsername);
    }
  }
  if (org) {
    return ensureDevHub(org, org.getUsername());
  } else {
    return undefined;
  }
};

export const getOrgOrThrow = async (input?: string): Promise<Org> => {
  const org = await maybeGetOrg(input);
  if (!org) {
    throw messages.createError('errors.NoDefaultEnv');
  }
  return org;
};

const ensureDevHub = async (org: Org, aliasOrUsername?: string): Promise<Org> => {
  if (await org.determineIfDevHubOrg()) {
    return org;
  }
  throw messages.createError('errors.NotADevHub', [aliasOrUsername ?? org.getUsername()]);
};

async function getDefaultHub(throwIfNotFound: false): Promise<string | undefined>;
async function getDefaultHub(throwIfNotFound: true): Promise<string>;
async function getDefaultHub(throwIfNotFound: boolean): Promise<string | undefined> {
  // check config for a default
  const config = await ConfigAggregator.create();
  const aliasOrUsername = config.getInfo(OrgConfigProperties.TARGET_DEV_HUB)?.value as string;
  if (throwIfNotFound && !aliasOrUsername) {
    throw messages.createError('errors.NoDefaultDevHub');
  }
  return aliasOrUsername;
}

export const getHubOrThrow = async (aliasOrUsername?: string): Promise<Org> => {
  const resolved = aliasOrUsername ?? (await getDefaultHub(true));
  const org = await Org.create({ aliasOrUsername: resolved, isDevHub: true });
  return ensureDevHub(org, resolved);
};

/**
 * An optional org specified by username or alias
 * Will default to the default org if one is not specified.
 * Will not throw if the specified org and default do not exist
 *
 * @example
 *
 * ```
 * import { Flags } from '@salesforce/sf-plugins-core';
 * public static flags = {
 *     // setting length or prefix
 *    'target-org': Flags.optionalOrg(),
 *    // adding properties
 *    'flag2': Flags.optionalOrg({
 *        required: true,
 *        description: 'flag2 description',
 *     }),
 * }
 * ```
 */
export const optionalOrgFlag = Flags.custom({
  char: 'o',
  noCacheDefault: true,
  parse: async (input: string | undefined) => maybeGetOrg(input),
  summary: messages.getMessage('flags.optionalTargetOrg.summary'),
  default: async () => maybeGetOrg(),
  defaultHelp: async (context) => {
    if (context.options instanceof Org) {
      const org = context.options as Org;
      return org.getUsername();
    }
    return (await maybeGetOrg())?.getUsername();
  },
});

/**
 * A required org, specified by username or alias
 * Will throw if the specified org default do not exist
 * Will default to the default org if one is not specified.
 * Will throw if no default org exists and none is specified
 *
 * @example
 *
 * ```
 * import { Flags } from '@salesforce/sf-plugins-core';
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
 * ```
 */
export const requiredOrgFlag = Flags.custom({
  char: 'o',
  summary: messages.getMessage('flags.targetOrg.summary'),
  noCacheDefault: true,
  parse: async (input: string | undefined) => getOrgOrThrow(input),
  default: async () => getOrgOrThrow(),
  defaultHelp: async (context) => {
    if (context.options instanceof Org) {
      const org = context.options as Org;
      return org.getUsername();
    }
    return (await maybeGetOrg())?.getUsername();
  },
  required: true,
});

/**
 * A required org that is a devHub
 * Will throw if the specified org does not exist
 * Will default to the default dev hub if one is not specified
 * Will throw if no default deb hub exists and none is specified
 *
 * @example
 *
 * ```
 * import { Flags } from '@salesforce/sf-plugins-core';
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
 * ```
 */
export const requiredHubFlag = Flags.custom({
  char: 'v',
  summary: messages.getMessage('flags.targetDevHubOrg.summary'),
  noCacheDefault: true,
  parse: async (input: string | undefined) => getHubOrThrow(input),
  default: async () => getHubOrThrow(),
  defaultHelp: async (context) => {
    if (context.options instanceof Org) {
      const org = context.options as Org;
      return org.getUsername();
    }
    return (await maybeGetHub())?.getUsername();
  },
  required: true,
});

/**
 * An optional org that, if present, must be a devHub
 * Will throw if the specified org does not exist
 * Will default to the default dev hub if one is not specified
 * Will NOT throw if no default deb hub exists and none is specified
 *
 * @example
 *
 * ```
 * import { Flags } from '@salesforce/sf-plugins-core';
 * public static flags = {
 *     // setting length or prefix
 *    'target-org': optionalHubFlag(),
 *    // adding properties
 *    'flag2': optionalHubFlag({
 *        description: 'flag2 description',
 *        char: 'h'
 *     }),
 * }
 * ```
 */
export const optionalHubFlag = Flags.custom({
  char: 'v',
  summary: messages.getMessage('flags.optionalTargetDevHubOrg.summary'),
  noCacheDefault: true,
  parse: async (input: string | undefined) => maybeGetHub(input),
  default: async () => maybeGetHub(),
  defaultHelp: async (context) => {
    if (context.options instanceof Org) {
      const org = context.options as Org;
      return org.getUsername();
    }
    return (await maybeGetHub())?.getUsername();
  },
  required: false,
});
