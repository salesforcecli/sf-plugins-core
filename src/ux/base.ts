/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AnyFunction } from '@salesforce/ts-types';

export class UxBase {
  public constructor(protected outputEnabled: boolean) {}

  protected maybeNoop(fn: AnyFunction<unknown>): void {
    if (this.outputEnabled) fn();
  }
}
