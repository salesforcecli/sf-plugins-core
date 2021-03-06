/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags as OclifFlags } from '@oclif/core';

export { toHelpSection } from './util';
export { Deployable, Deployer } from './deployer';
export { Deauthorizer } from './deauthorizer';
export { Progress, Prompter, generateTableChoices } from './ux';
export { SfHook } from './hooks';
export * from './types';
export { SfCommand, SfCommandInterface, StandardColors } from './sfCommand';

// custom flags
import { requiredOrgFlag, requiredHubFlag, optionalOrgFlag } from './flags/orgFlags';
import { salesforceIdFlag } from './flags/salesforceId';
import { orgApiVersionFlag } from './flags/orgApiVersion';
import { durationFlag } from './flags/duration';

export const Flags = {
  boolean: OclifFlags.boolean,
  directory: OclifFlags.directory,
  enum: OclifFlags.enum,
  file: OclifFlags.file,
  integer: OclifFlags.integer,
  string: OclifFlags.string,
  url: OclifFlags.url,
  duration: durationFlag,
  salesforceId: salesforceIdFlag,
  orgApiVersion: orgApiVersionFlag,
  requiredOrg: requiredOrgFlag,
  requiredHub: requiredHubFlag,
  optionalOrg: optionalOrgFlag,
};
