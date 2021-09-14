/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { JsonMap } from '@salesforce/ts-types';

export abstract class Deauthorizer<T = JsonMap> {
  public async removeAll(): Promise<Deauthorizer.Result> {
    const result = {
      successes: [],
      failures: [],
    } as Deauthorizer.Result;

    const environments = await this.find();
    for (const id of Object.keys(environments)) {
      try {
        await this.remove(id);
        result.successes.push(id);
      } catch {
        result.failures.push(id);
      }
    }
    return result;
  }

  /**
   * This method should return a list of all the environments a deauthorizer could deauthorize.
   */
  public abstract find(): Promise<Record<string, T>>;

  /**
   * This method should deauthorize an environment.
   */
  public abstract remove(id: string): Promise<boolean>;
}

export namespace Deauthorizer {
  export type Result = {
    successes: string[];
    failures: string[];
  };
}
