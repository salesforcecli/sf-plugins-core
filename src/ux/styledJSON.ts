/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { createRequire } from 'node:module';
import { highlight, CardinalTheme } from 'cardinal';
import chalk from 'chalk';

// @oclif/core v4 will have native support for coloring JSON so we won't need this then.
export default function styledJSON(obj: unknown): string {
  const json = JSON.stringify(obj, null, 2);
  if (!chalk.level) {
    return json;
  }

  const require = createRequire(import.meta.url);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const theme = require('cardinal/themes/jq') as CardinalTheme;
  return highlight(json, { theme });
}
