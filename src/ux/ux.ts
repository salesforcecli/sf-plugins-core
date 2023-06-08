/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { ux } from '@oclif/core';
import { AnyJson } from '@salesforce/ts-types';
import { UxBase } from './base';
import { Prompter } from './prompter';
import { Spinner } from './spinner';

/**
 * UX methods for plugins. Automatically suppress console output if outputEnabled is set to false.
 *
 * @example
 * ```
 * import { SfCommand, Ux } from '@salesforce/sf-plugins-core';
 * import { AnyJson } from '@salesforce/ts-types';
 *
 * class MyCommand extends SfCommand<AnyJson> {
 *   public async run(): Promise<AnyJson> {
 *     const ux = new Ux(!this.jsonEnabled());
 *   }
 * }
 *
 * ```
 */
export class Ux extends UxBase {
  public readonly spinner: Spinner;
  public readonly prompter: Prompter;
  public readonly outputEnabled: boolean;

  public constructor({ jsonEnabled } = { jsonEnabled: false }) {
    super(!jsonEnabled);
    this.outputEnabled = !jsonEnabled;
    this.spinner = new Spinner(this.outputEnabled);
    this.prompter = new Prompter();
  }

  /**
   * Log a message to the console. This will be automatically suppressed if output is disabled.
   *
   * @param message Message to log. Formatting is supported.
   * @param args Args to be used for formatting.
   */
  public log(message?: string, ...args: string[]): void {
    this.maybeNoop(() => ux.log(message, ...args));
  }

  /**
   * Log a warning message to the console. This will be automatically suppressed if output is disabled.
   *
   * @param message Warning message to log.
   */
  public warn(message: string | Error): void {
    this.maybeNoop(() => ux.warn(message));
  }

  /**
   * Display a table to the console. This will be automatically suppressed if output is disabled.
   *
   * @param data Data to be displayed
   * @param columns Columns to display the data in
   * @param options Options for how the table should be displayed
   */
  public table<T extends Ux.Table.Data>(data: T[], columns: Ux.Table.Columns<T>, options?: Ux.Table.Options): void {
    this.maybeNoop(() => ux.table(data, columns, { 'no-truncate': true, ...options }));
  }

  /**
   * Display a url to the console. This will be automatically suppressed if output is disabled.
   *
   * @param text text to display
   * @param uri URL link
   * @param params
   */
  public url(text: string, uri: string, params = {}): void {
    this.maybeNoop(() => ux.url(text, uri, params));
  }

  /**
   * Display stylized JSON to the console. This will be automatically suppressed if output is disabled.
   *
   * @param obj JSON to display
   */
  public styledJSON(obj: AnyJson): void {
    this.maybeNoop(() => ux.styledJSON(obj));
  }

  /**
   * Display stylized object to the console. This will be automatically suppressed if output is disabled.
   *
   * @param obj Object to display
   * @param keys Keys of object to display
   */
  public styledObject(obj: AnyJson, keys?: string[]): void {
    this.maybeNoop(() => ux.styledObject(obj, keys));
  }

  /**
   * Display stylized header to the console. This will be automatically suppressed if output is disabled.
   *
   * @param text header to display
   */
  public styledHeader(text: string): void {
    this.maybeNoop(() => ux.styledHeader(text));
  }
}

export namespace Ux {
  export namespace Table {
    export type Data = Record<string, unknown>;
    export type Columns<T extends Data> = ux.Table.table.Columns<T>;
    export type Options = ux.Table.table.Options;
  }
}
