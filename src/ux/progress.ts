/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import util from 'node:util';
import { Options, SingleBar } from 'cli-progress';
import { UxBase } from './base.js';

function progress(options: Options = {}): Progress.Bar {
  return new SingleBar({ noTTYOutput: Boolean(process.env.TERM === 'dumb' || !process.stdin.isTTY), ...options });
}

/**
 * Class for display a progress bar to the console. Will automatically be suppressed if the --json flag is present.
 */
export class Progress extends UxBase {
  private static DEFAULT_OPTIONS = {
    title: 'PROGRESS',
    format: '%s | {bar} | {value}/{total} Components',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    linewrap: true,
  };

  private bar!: Progress.Bar;
  private total!: number;
  private started = false;

  public constructor(outputEnabled: boolean) {
    super(outputEnabled);
  }

  /**
   * Set the total number of expected components.
   */
  public setTotal(total: number): void {
    this.total = total;
    if (this.bar) this.bar.setTotal(total);
  }

  /**
   * Start the progress bar.
   */
  public start(
    total: number,
    payload: Progress.Payload = {},
    options: Partial<Progress.Options> = Progress.DEFAULT_OPTIONS
  ): void {
    if (this.started) return;
    this.started = true;

    this.maybeNoop(() => {
      const { title, ...rest } = { ...Progress.DEFAULT_OPTIONS, ...options };
      this.bar = progress({
        ...rest,
        format: util.format(rest.format, title),
      });

      this.bar.setTotal(total);
      this.bar.start(total, 0);
      if (Object.keys(payload).length) {
        this.bar.update(0, payload);
      }
    });
  }

  /**
   * Update the progress bar.
   */
  public update(num: number, payload = {}): void {
    if (this.bar) this.bar.update(num, payload);
  }

  /**
   * Update the progress bar with the final number and stop it.
   */
  public finish(payload = {}): void {
    if (this.bar) {
      this.bar.update(this.total, payload);
      this.bar.stop();
    }
  }

  /**
   * Stop the progress bar.
   */
  public stop(): void {
    if (this.bar) this.bar.stop();
  }
}

export namespace Progress {
  export type Bar = {
    start: (total: number, startValue: number, payload?: object) => void;
    update: (num: number, payload?: object) => void;
    setTotal: (num: number) => void;
    stop: () => void;
  };

  export type Options = {
    title: string;
    format: string;
    barCompleteChar: string;
    barIncompleteChar: string;
    linewrap: boolean;
    noTTYOutput: boolean;
  };

  export type Payload = Record<string, unknown>;
}
