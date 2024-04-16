/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { inspect } from 'node:util';
import chalk from 'chalk';

/* eslint-disable @typescript-eslint/no-explicit-any */

function pp(obj: any): any {
  if (typeof obj === 'string' || typeof obj === 'number') return obj;
  if (typeof obj === 'object') {
    return (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Object.keys(obj)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .map((k) => k + ': ' + inspect(obj[k]))
        .join(', ')
    );
  }

  return inspect(obj);
}

// @oclif/core v4 will have native support for coloring JSON so we won't need this then.
export default function styledObject(obj: any, keys?: string[]): string {
  const output: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const keyLengths = Object.keys(obj).map((key) => key.toString().length);
  const maxKeyLength = Math.max(...keyLengths) + 2;

  const logKeyValue = (key: string, value: any): string =>
    `${chalk.blue(key)}:` + ' '.repeat(maxKeyLength - key.length - 1) + pp(value);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  for (const key of keys ?? Object.keys(obj).sort()) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const value = obj[key];
    if (Array.isArray(value)) {
      if (value.length > 0) {
        output.push(logKeyValue(key, value[0]));
        for (const e of value.slice(1)) {
          output.push(' '.repeat(maxKeyLength) + pp(e));
        }
      }
    } else if (value !== null && value !== undefined) {
      output.push(logKeyValue(key, value));
    }
  }

  return output.join('\n');
}
