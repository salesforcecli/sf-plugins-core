/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { makeTable as oclifMakeTable, TableOptions } from '@oclif/table';
import { env } from '@salesforce/kit';

type Column<T extends Record<string, unknown>> = {
  extended: boolean;
  header: string;
  minWidth: number;
  get(row: T): unknown;
};

type Columns<T extends Record<string, unknown>> = { [key: string]: Partial<Column<T>> };

type Options = {
  columns?: string;
  extended?: boolean;
  filter?: string;
  'no-header'?: boolean;
  'no-truncate'?: boolean;
  rowStart?: string;
  sort?: string;
  title?: string;
  printLine?(s: unknown): void;
};

/**
 * Converts inputs to previous table API to the new table API.
 *
 * Note that the following options will not be converted:
 * - 'extended'
 * - 'filter'
 * - 'sort'
 * - 'no-header'
 * - 'no-truncate'
 * - 'row-start'
 * - 'print-line'
 *
 * @deprecated Please use the new table API directly.
 */
export function convertToNewTableAPI<T extends Record<string, unknown>>(
  data: T[],
  columns: Columns<T>,
  options?: Options
): TableOptions<Record<string, unknown>> {
  const cols = Object.entries(columns).map(([key, opts]) => {
    if (opts.header) return { key, name: opts.header };
    return key;
  });
  const d = data.map((row) =>
    Object.fromEntries(Object.entries(columns).map(([key, { get }]) => [key, get ? get(row) : row[key]]))
  ) as Array<Record<string, unknown>>;

  return { data: d, title: options?.title, borderStyle: 'headers-only-with-underline', columns: cols };
}

export function getTableDefaults<T extends Record<string, unknown>>(
  options: TableOptions<T>
): Pick<TableOptions<T>, 'borderStyle' | 'noStyle' | 'headerOptions'> {
  const borderStyles = [
    'all',
    'headers-only-with-outline',
    'headers-only-with-underline',
    'headers-only',
    'horizontal-with-outline',
    'horizontal',
    'none',
    'outline',
    'vertical-with-outline',
    'vertical',
  ];

  const defaultStyle = 'vertical-with-outline';
  const determineBorderStyle = (): TableOptions<T>['borderStyle'] => {
    const envVar = env.getString('SF_TABLE_BORDER_STYLE', defaultStyle);
    if (borderStyles.includes(envVar)) {
      return envVar as TableOptions<T>['borderStyle'];
    }

    return defaultStyle;
  };

  return {
    borderStyle: determineBorderStyle(),
    noStyle: env.getBoolean('SF_NO_TABLE_STYLE', false),
    headerOptions: {
      ...options.headerOptions,
      formatter: 'capitalCase',
    },
  };
}

/**
 * Generates a string representation of a table from the given options.
 *
 * Consumers should prefer to use the `table` method on the `Ux` class since that will
 * respond appropriately to the presence of the `--json` flag.
 *
 * @template T - The type of the records in the table.
 * @param {TableOptions<T>} options - The options to configure the table.
 * @returns {string} The string representation of the table.
 */
export function makeTable<T extends Record<string, unknown>>(options: TableOptions<T>): string {
  return oclifMakeTable({
    ...options,
    // Don't allow anyone to override these properties
    ...getTableDefaults(options),
  });
}
