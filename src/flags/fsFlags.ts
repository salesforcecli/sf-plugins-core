/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import { Flags } from '@oclif/core';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');

/**
 * Accepts a directory path.  Validates that the directory exists and is a directory.
 */
export const existingDirectory = Flags.build<string>({
  parse: async (input: string) => await dirExists(input),
});

/**
 * Accepts a file path.  Validates that the file exists and is a file.
 */
export const existingFile = Flags.build<string>({
  parse: async (input: string) => await fileExists(input),
});

const dirExists = async (input: string): Promise<string> => {
  if (!fs.existsSync(input)) {
    throw messages.createError('flags.existingDirectory.errors.MissingDirectory', [input]);
  }
  if (!(await fs.promises.stat(input)).isDirectory()) {
    throw messages.createError('flags.existingDirectory.errors.NotADirectory', [input]);
  }

  return input;
};

const fileExists = async (input: string): Promise<string> => {
  if (!fs.existsSync(input)) {
    throw messages.createError('flags.existingFile.errors.MissingFile', [input]);
  }
  if (!(await fs.promises.stat(input)).isFile()) {
    throw messages.createError('flags.existingFile.errors.NotAFile', [input]);
  }

  return input;
};
