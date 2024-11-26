/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { TableOptions } from '@oclif/table';
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

export function getDefaults<T extends Record<string, unknown>>(options: TableOptions<T>): Partial<TableOptions<T>> {
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

  const overflowOptions = ['wrap', 'truncate', 'truncate-middle', 'truncate-start', 'truncate-end'];
  const determineOverflow = (): TableOptions<T>['overflow'] => {
    const envVar = env.getString('SF_TABLE_OVERFLOW');
    if (envVar && overflowOptions.includes(envVar)) {
      return envVar as TableOptions<T>['overflow'];
    }

    return options.overflow;
  };

  return {
    borderStyle: determineBorderStyle(),
    noStyle: env.getBoolean('SF_NO_TABLE_STYLE', false),
    headerOptions: {
      ...options.headerOptions,
      formatter: 'capitalCase',
    },
    overflow: determineOverflow(),
  };
}
