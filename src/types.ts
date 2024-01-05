/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { StructuredMessage } from '@salesforce/core';

// a standlone type here to avoid circular dependencies
export interface SfCommandError {
  status: number;
  name: string;
  message: string;
  stack: string | undefined;
  warnings?: Array<StructuredMessage | string>;
  actions?: string[];
  code?: unknown;
  exitCode?: number;
  data?: unknown;
  context?: string;
  commandName?: string;
}
