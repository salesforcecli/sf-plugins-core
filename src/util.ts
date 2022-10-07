/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  EnvironmentVariable,
  OrgConfigProperties,
  ORG_CONFIG_ALLOWED_PROPERTIES,
  SfdxPropertyKeys,
  SFDX_ALLOWED_PROPERTIES,
  SUPPORTED_ENV_VARS,
  Messages,
} from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');

export type HelpSection = {
  header: string;
  body: Array<{ name: string; description: string } | undefined>;
};

/**
 * Function to build a help section for command help.
 * Takes a string to be used as section header text and an array of enums
 * that identify the variable or property to be included in the help
 * body.
 *
 * @param header
 * @param vars
 */
export function toHelpSection(
  header: string,
  ...vars: Array<OrgConfigProperties | SfdxPropertyKeys | EnvironmentVariable | string | Record<string, string>>
): HelpSection {
  const body = vars
    .flatMap((v) => {
      if (typeof v === 'string') {
        const orgConfig = ORG_CONFIG_ALLOWED_PROPERTIES.find(({ key }) => {
          return key === v;
        });
        if (orgConfig) {
          return { name: orgConfig.key, description: orgConfig.description };
        }
        const sfdxProperty = SFDX_ALLOWED_PROPERTIES.find(({ key }) => key === v);
        if (sfdxProperty) {
          return { name: sfdxProperty.key.valueOf(), description: sfdxProperty.description };
        }
        const envVar = Object.entries(SUPPORTED_ENV_VARS).find(([k]) => k === v);

        if (envVar) {
          const [eKey, data] = envVar;
          return { name: eKey, description: data.description };
        }
        return undefined;
      } else {
        return Object.entries(v).map(([name, description]) => ({ name, description }));
      }
    })
    .filter((b) => b);
  return { header, body };
}

export function parseVarArgs(args: Record<string, unknown>, argv: string[]): Record<string, unknown> {
  const final: Record<string, unknown> = {};
  const argVals = Object.values(args);

  // Remove arguments from varargs
  const varargs = argv.filter((val) => !argVals.includes(val));

  // Support `config set key value`
  if (varargs.length === 2 && !varargs[0].includes('=')) {
    return { [varargs[0]]: varargs[1] };
  }

  // Ensure that all args are in the right format (e.g. key=value key1=value1)
  varargs.forEach((arg) => {
    const split = arg.split('=');

    if (split.length !== 2) {
      throw messages.createError('error.InvalidArgumentFormat', [arg]);
    }

    const [name, value] = split;

    if (final[name]) {
      throw messages.createError('error.DuplicateArgument', [name]);
    }

    final[name] = value || undefined;
  });

  return final;
}
