/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { ux, Table as UxTable } from 'cli-ux';
import { AnyFunction, AnyJson } from '@salesforce/ts-types';

export class Ux {
  public constructor(protected outputEnabled: boolean) {}

  public table<T extends Ux.Table.Data>(data: T[], columns: Ux.Table.Columns<T>, options?: Ux.Table.Options): void {
    this.maybeNoop(() => ux.table(data, columns, options));
  }

  public url(text: string, uri: string, params = {}): void {
    this.maybeNoop(() => ux.url(text, uri, params));
  }

  public styledJSON(obj: AnyJson): void {
    this.maybeNoop(() => ux.styledJSON(obj));
  }

  public styledObject(obj: AnyJson): void {
    this.maybeNoop(() => ux.styledObject(obj));
  }

  protected maybeNoop(fn: AnyFunction<unknown>): void {
    if (this.outputEnabled) fn();
  }
}

export namespace Ux {
  export namespace Table {
    export type Data = Record<string, unknown>;
    export type Columns<T extends Data> = UxTable.table.Columns<T>;
    export type Options = UxTable.table.Options;
  }
}
