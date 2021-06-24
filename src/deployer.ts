/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { EventEmitter } from 'events';
import { Dictionary, Nullable } from '@salesforce/ts-types';
import cli from 'cli-ux';

export interface Preferences {
  interactive: boolean;
}

export interface Options {
  deployers: Set<Deployer>;
  username: string;
}

/**
 * Deploy a piece of a project.
 */
export abstract class Deployer extends EventEmitter {
  // Standard methods implemented in the base class methods
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public progress(current: number, total: number, message: string): void {}

  public log(msg: string | undefined, ...args: string[]): void {
    cli.log(msg, ...args);
  }

  abstract getAppName(): string;
  abstract getAppType(): string;
  abstract getAppPath(): string;
  abstract getEnvType(): Nullable<string>;

  // These methods are only called if the CLI user decides to deploy that piece of the project.

  /**
   * Perform any initialization or setup. This is the time to prompt the
   * user for any needed information. It should do so by respecting the user's
   * preferences when possible (i.e. interactive mode or wait times).
   *
   * If options are passed it, it should use those instead of prompting the for the passed in information
   *
   * Uses the returned dictionary as the information to store in the project-deploy-options.json file.
   */
  public abstract setup(preferences: Preferences, options?: Dictionary<string>): Promise<Dictionary<string>>;

  /**
   * Deploy the app.
   */
  public abstract deploy(): Promise<void>;
}
