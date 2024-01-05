/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Flags as OclifFlags } from '@oclif/core';

// custom flags
import { requiredOrgFlag, requiredHubFlag, optionalOrgFlag, optionalHubFlag } from './orgFlags.js';
import { salesforceIdFlag } from './salesforceId.js';
import { orgApiVersionFlag } from './orgApiVersion.js';
import { durationFlag } from './duration.js';

export const Flags = {
  boolean: OclifFlags.boolean,
  directory: OclifFlags.directory,
  file: OclifFlags.file,
  integer: OclifFlags.integer,
  string: OclifFlags.string,
  option: OclifFlags.option,
  url: OclifFlags.url,
  custom: OclifFlags.custom,
  duration: durationFlag,
  salesforceId: salesforceIdFlag,
  orgApiVersion: orgApiVersionFlag,
  requiredOrg: requiredOrgFlag,
  requiredHub: requiredHubFlag,
  optionalOrg: optionalOrgFlag,
  optionalHub: optionalHubFlag,
};
