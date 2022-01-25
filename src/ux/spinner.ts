/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { ux } from 'cli-ux';
import { Ux } from '.';

/**
 * This class is a light wrapper around CliUx.ux.action that allows us to
 * automatically suppress any actions if `--json` flag is present.
 */
export class Spinner extends Ux {
  public constructor(outputEnabled: boolean) {
    super(outputEnabled);
  }

  /**
   * Start a spinner on the console.
   */
  public start(action: string, status?: string, opts?: { stdout?: boolean }): void {
    this.maybeNoop(() => ux.action.start(action, status, opts));
  }

  /**
   * Stop the spinner on the console.
   */
  public stop(msg?: string): void {
    this.maybeNoop(() => ux.action.stop(msg));
  }

  /**
   * Set the status of the current spinner.
   */
  public set status(status: string | undefined) {
    ux.action.status = status;
  }

  /**
   * Get the status of the current spinner.
   */
  public get status(): string | undefined {
    return ux.action.status;
  }

  /**
   * Pause the spinner on the console.
   */
  public pause(fn: () => unknown, icon?: string): void {
    this.maybeNoop(() => ux.action.pause(fn, icon));
  }
}
