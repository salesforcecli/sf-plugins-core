/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { inspect } from 'node:util';
import ansis from 'ansis';
import { AnyJson } from '@salesforce/ts-types';

function prettyPrint(obj: AnyJson): string {
  if (!obj) return inspect(obj);
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'number') return obj.toString();
  if (typeof obj === 'boolean') return obj.toString();
  if (typeof obj === 'object') {
    return Object.entries(obj)
      .map(([key, value]) => `${key}: ${inspect(value)}`)
      .join(', ');
  }

  return inspect(obj);
}

export default function styledObject(obj: AnyJson, keys?: string[]): string {
  if (!obj) return inspect(obj);
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'number') return obj.toString();
  if (typeof obj === 'boolean') return obj.toString();

  const output: string[] = [];
  const keyLengths = Object.keys(obj).map((key) => key.toString().length);
  const maxKeyLength = Math.max(...keyLengths) + 2;

  const logKeyValue = (key: string, value: AnyJson): string =>
    `${ansis.blue(key)}:` + ' '.repeat(maxKeyLength - key.length - 1) + prettyPrint(value);

  for (const [key, value] of Object.entries(obj)) {
    if (keys && !keys.includes(key)) continue;
    if (Array.isArray(value)) {
      if (value.length > 0) {
        output.push(logKeyValue(key, value[0]));
        for (const e of value.slice(1)) {
          output.push(' '.repeat(maxKeyLength) + prettyPrint(e));
        }
      }
    } else if (value !== null && value !== undefined) {
      output.push(logKeyValue(key, value));
    }
  }

  return output.join('\n');
}
