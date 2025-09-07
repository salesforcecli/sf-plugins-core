/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ux } from '@oclif/core';
import { UxBase } from './base.js';

/**
 * This class is a light wrapper around ux.action that allows us to
 * automatically suppress any actions if `--json` flag is present.
 */
export class Spinner extends UxBase {
  public constructor(outputEnabled: boolean) {
    super(outputEnabled);
  }

  /**
   * Get the status of the current spinner.
   */
  // eslint-disable-next-line class-methods-use-this
  public get status(): string | undefined {
    return ux.action.status;
  }

  /**
   * Set the status of the current spinner.
   */
  // eslint-disable-next-line class-methods-use-this
  public set status(status: string | undefined) {
    ux.action.status = status;
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
   * Pause the spinner on the console.
   */
  public pause(fn: () => unknown, icon?: string): void {
    this.maybeNoop(() => ux.action.pause(fn, icon));
  }
}
