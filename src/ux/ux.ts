/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { CliUx } from '@oclif/core';
import { AnyJson } from '@salesforce/ts-types';
import { UxBase } from './base';
import { Prompter } from './prompter';
import { Spinner } from './spinner';

/**
 * UX methods for plugins. Automatically suppress console output if outputEnabled is set to false.
 */
export class Ux extends UxBase {
  public spinner: Spinner;
  public prompter: Prompter;

  public constructor(outputEnabled: boolean) {
    super(outputEnabled);
    this.spinner = new Spinner(outputEnabled);
    this.prompter = new Prompter();
  }

  public table<T extends Ux.Table.Data>(data: T[], columns: Ux.Table.Columns<T>, options?: Ux.Table.Options): void {
    this.maybeNoop(() => CliUx.ux.table(data, columns, options));
  }

  public url(text: string, uri: string, params = {}): void {
    this.maybeNoop(() => CliUx.ux.url(text, uri, params));
  }

  public styledJSON(obj: AnyJson): void {
    this.maybeNoop(() => CliUx.ux.styledJSON(obj));
  }

  public styledObject(obj: AnyJson): void {
    this.maybeNoop(() => CliUx.ux.styledObject(obj));
  }

  public styledHeader(text: string): void {
    this.maybeNoop(() => CliUx.ux.styledHeader(text));
  }
}

export namespace Ux {
  export namespace Table {
    export type Data = Record<string, unknown>;
    export type Columns<T extends Data> = CliUx.Table.table.Columns<T>;
    export type Options = CliUx.Table.table.Options;
  }
}
