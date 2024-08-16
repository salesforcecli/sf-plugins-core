/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { MultiStageOutput as OclifMultiStageOutput, MultiStageOutputOptions } from '@oclif/multi-stage-output';

export class MultiStageOutput<T extends Record<string, unknown>> extends OclifMultiStageOutput<T> {
  public constructor(opts: MultiStageOutputOptions<T> & { outputEnabled: boolean }) {
    const { outputEnabled, ...rest } = opts;
    super(rest);
    if (!outputEnabled) {
      this.stop();
    }
  }
}
