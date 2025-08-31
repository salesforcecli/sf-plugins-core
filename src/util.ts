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

import {
  EnvironmentVariable,
  OrgConfigProperties,
  ORG_CONFIG_ALLOWED_PROPERTIES,
  SfdxPropertyKeys,
  SFDX_ALLOWED_PROPERTIES,
  SUPPORTED_ENV_VARS,
  Messages,
} from '@salesforce/core';
import { HelpSection, HelpSectionKeyValueTable } from '@oclif/core';

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
        const orgConfig = ORG_CONFIG_ALLOWED_PROPERTIES.find(({ key }) => key.toString() === v);
        if (orgConfig) {
          return { name: orgConfig.key, description: orgConfig.description };
        }
        const sfdxProperty = SFDX_ALLOWED_PROPERTIES.find(({ key }) => key.toString() === v);
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
    .filter(isHelpSectionBodyEntry);
  return { header, body };
}

const isHelpSectionBodyEntry = (entry: unknown): entry is HelpSectionKeyValueTable[number] =>
  typeof entry === 'object' && entry !== null && 'name' in entry && 'description' in entry;

export function parseVarArgs(args: Record<string, unknown>, argv: string[]): Record<string, string | undefined> {
  const final: Record<string, string | undefined> = {};
  const argVals = Object.values(args);

  // Remove arguments from varargs
  const varargs = argv.filter((val) => !argVals.includes(val));

  // Support `config set key value`
  if (varargs.length === 2 && !varargs[0].includes('=')) {
    return { [varargs[0]]: varargs[1] };
  }

  Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
  const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');

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
export const removeEmpty = (obj: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null));
