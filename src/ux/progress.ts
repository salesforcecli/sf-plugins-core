/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as util from 'util';
import { ux } from 'cli-ux';
import { once } from '@salesforce/kit';
import { UxBase } from '.';

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

  public constructor(outputEnabled: boolean) {
    super(outputEnabled);
  }

  /**
   * Set the total number of expected components.
   */
  public setTotal(total: number): void {
    this.total = total;
    this.bar.setTotal(total);
  }

  /**
   * Start the progress bar.
   */
  public start(
    total: number,
    payload: Progress.Payload = {},
    options: Partial<Progress.Options> = Progress.DEFAULT_OPTIONS
  ): void {
    const opts = Object.assign(Progress.DEFAULT_OPTIONS, options);
    opts.format = util.format(opts.format, opts.title);
    this.bar = ux.progress({
      format: opts.format,
      barCompleteChar: opts.barCompleteChar,
      barIncompleteChar: opts.barIncompleteChar,
      linewrap: opts.linewrap,
    }) as Progress.Bar;

    this.bar.setTotal(total);
    // this.maybeNoop(() => startProgressBar(this.bar, total, payload));
    this.maybeNoop(() => {
      this._start(total, payload);
    });
  }

  /**
   * Update the progress bar.
   */
  public update(num: number, payload = {}): void {
    this.bar.update(num, payload);
  }

  /**
   * Update the progress bar with the final number and stop it.
   */
  public finish(payload = {}): void {
    this.bar.update(this.total, payload);
    this.bar.stop();
  }

  /**
   * Stop the progress bar.
   */
  public stop(): void {
    this.bar.stop();
  }

  private _start(total: number, payload: Progress.Payload = {}): void {
    const start = once((bar: Progress.Bar, t: number, p: Progress.Payload = {}) => {
      bar.start(t);
      if (Object.keys(p).length) {
        bar.update(0, p);
      }
    });
    start(this.bar, total, payload);
  }
}

export namespace Progress {
  export type Bar = {
    start: (num: number, payload?: unknown) => void;
    update: (num: number, payload?: unknown) => void;
    updateTotal: (num: number) => void;
    setTotal: (num: number) => void;
    stop: () => void;
  };

  export type Options = {
    title: string;
    format: string;
    barCompleteChar: string;
    barIncompleteChar: string;
    linewrap: boolean;
  };

  export type Payload = Record<string, unknown>;
}
