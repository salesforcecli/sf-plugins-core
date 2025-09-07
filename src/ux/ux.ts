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

import ansis from 'ansis';
import { ux } from '@oclif/core';
import { AnyJson } from '@salesforce/ts-types';
import terminalLink from 'terminal-link';
import { makeTable, printTable, TableOptions } from '@oclif/table';
import { UxBase } from './base.js';
import { Spinner } from './spinner.js';
import styledObject from './styledObject.js';
import { getDefaults } from './table.js';

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
  public readonly outputEnabled: boolean;

  public constructor({ jsonEnabled } = { jsonEnabled: false }) {
    super(!jsonEnabled);
    this.outputEnabled = !jsonEnabled;
    this.spinner = new Spinner(this.outputEnabled);
  }

  /**
   * Log a message to the console. This will be automatically suppressed if output is disabled.
   *
   * @param message Message to log. Formatting is supported.
   * @param args Args to be used for formatting.
   */
  public log(message?: string, ...args: string[]): void {
    this.maybeNoop(() => ux.stdout(message, ...args));
  }

  /**
   * Log a message to stderr. This will be automatically suppressed if output is disabled.
   *
   * @param message Message to log. Formatting is supported.
   * @param args Args to be used for formatting.
   */
  public logToStderr(message?: string, ...args: string[]): void {
    this.maybeNoop(() => ux.stderr(message, ...args));
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
   * @param options Table properties
   */
  public table<T extends Record<string, unknown>>(options: TableOptions<T>): void {
    this.maybeNoop(() =>
      printTable({
        ...options,
        ...getDefaults<T>(options),
      })
    );
  }

  /**
   * Return a string rendering of a table.
   *
   * @param options Table properties
   * @returns string rendering of a table
   */
  // eslint-disable-next-line class-methods-use-this
  public makeTable<T extends Record<string, unknown>>(options: TableOptions<T>): string {
    return makeTable({
      ...options,
      ...getDefaults<T>(options),
    });
  }

  /**
   * Display a url to the console. This will be automatically suppressed if output is disabled.
   *
   * @param text text to display
   * @param uri URL link
   * @param params
   */
  public url(text: string, uri: string, params = {}): void {
    this.maybeNoop(() => ux.stdout(terminalLink(text, uri, { fallback: () => uri, ...params })));
  }

  /**
   * Display stylized JSON to the console. This will be automatically suppressed if output is disabled.
   *
   * @param obj JSON to display
   */
  public styledJSON(obj: AnyJson, theme?: Record<string, string>): void {
    // Default theme if sf's theme.json does not have the json property set. This will allow us
    // to ship sf-plugins-core before the theme.json is updated.
    const defaultTheme = {
      key: 'blueBright',
      string: 'greenBright',
      number: 'blue',
      boolean: 'redBright',
      null: 'blackBright',
    };

    const mergedTheme = { ...defaultTheme, ...theme };

    this.maybeNoop(() => ux.stdout(ux.colorizeJson(obj, { theme: mergedTheme })));
  }

  /**
   * Display stylized object to the console. This will be automatically suppressed if output is disabled.
   *
   * @param obj Object to display
   * @param keys Keys of object to display
   */
  public styledObject(obj: AnyJson, keys?: string[]): void {
    this.maybeNoop(() => ux.stdout(styledObject(obj, keys)));
  }

  /**
   * Display stylized header to the console. This will be automatically suppressed if output is disabled.
   *
   * @param text header to display
   */
  public styledHeader(text: string): void {
    this.maybeNoop(() => ux.stdout(ansis.dim('=== ') + ansis.bold(text) + '\n'));
  }
}
