/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { cli } from 'cli-ux';

/**
 * This class is a light wrapper around cli.action that allows us to
 * automatically suppress any actions if `--json` flag is present.
 */
export class Spinner {
  public constructor(private jsonEnabled: boolean) {}

  /**
   * Start a spinner on the console.
   */
  public start(action: string, status?: string, opts?: { stdout?: boolean }): void {
    if (!this.jsonEnabled) cli.action.start(action, status, opts);
  }

  /**
   * Stop the spinner on the console.
   */
  public stop(msg?: string): void {
    if (!this.jsonEnabled) cli.action.stop(msg);
  }

  /**
   * Set the status of the current spinner.
   */
  public status(status: string): void {
    if (!this.jsonEnabled) cli.action.status = status;
  }

  /**
   * Pause the spinner on the console.
   */
  public pause(fn: () => unknown, icon?: string): void {
    if (!this.jsonEnabled) cli.action.pause(fn, icon);
  }
}
