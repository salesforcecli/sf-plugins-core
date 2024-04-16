/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { format } from 'node:util';

const stdout = (str: string | string[] | undefined, ...args: string[]): void => {
  if (typeof str === 'string' || !str) {
    process.stdout.write(format(str, ...args) + '\n');
  } else {
    process.stdout.write(format(...str, ...args) + '\n');
  }
};

const stderr = (str: string | string[] | undefined, ...args: string[]): void => {
  if (typeof str === 'string' || !str) {
    process.stderr.write(format(str, ...args) + '\n');
  } else {
    process.stderr.write(format(...str, ...args) + '\n');
  }
};

export default {
  stdout,
  stderr,
};
