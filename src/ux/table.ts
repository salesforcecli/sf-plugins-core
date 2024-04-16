/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { inspect } from 'node:util';
import chalk from 'chalk';
import jsyaml from 'js-yaml';
import { orderBy } from 'natural-orderby';
import sliceAnsi from 'slice-ansi';
import sw from 'string-width';

import write from './write.js';

function sumBy<T>(arr: T[], fn: (i: T) => number): number {
  return arr.reduce((sum, i) => sum + fn(i), 0);
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
}

function termwidth(stream: NodeJS.WriteStream): number {
  if (!stream.isTTY) {
    return 80;
  }

  const width = stream.getWindowSize()[0];
  if (width < 1) {
    return 80;
  }

  if (width < 40) {
    return 40;
  }

  return width;
}

const stdtermwidth = Number.parseInt(process.env.OCLIF_COLUMNS!, 10) || termwidth(process.stdout);

class Table<T extends Record<string, unknown>> {
  private columns: Array<Column<T> & { key: string; maxWidth?: number; width?: number }>;

  private options: Options & { printLine: (s: unknown) => void };

  private data: Array<Record<string, unknown>>;

  public constructor(data: T[], columns: Columns<T>, options: Options = {}) {
    // assign columns
    this.columns = Object.keys(columns).map((key: string) => {
      const col = columns[key];
      const extended = col.extended ?? false;
      // turn null and undefined into empty strings by default
      const get = col.get ?? ((row: Record<string, unknown>): unknown => row[key] ?? '');
      const header = typeof col.header === 'string' ? col.header : capitalize(key.replaceAll('_', ' '));
      const minWidth = Math.max(col.minWidth ?? 0, sw(header) + 1);

      return {
        extended,
        get,
        header,
        key,
        minWidth,
      };
    });

    // assign options
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { columns: cols, csv, extended, filter, output, printLine, sort, title } = options;
    this.options = {
      columns: cols,
      extended,
      filter,
      'no-header': options['no-header'] ?? false,
      'no-truncate': options['no-truncate'] ?? false,
      output: csv ? 'csv' : output,
      printLine: printLine ?? ((s: string): void => write.stdout(s)),
      rowStart: ' ',
      sort,
      title,
    };

    // build table rows from input array data
    let rows = data.map((d) =>
      Object.fromEntries(
        this.columns.map((col) => {
          let val = col.get(d);
          if (typeof val !== 'string') val = inspect(val, { breakLength: Number.POSITIVE_INFINITY });
          return [col.key, val];
        })
      )
    );

    // filter rows
    if (this.options.filter) {
      // eslint-disable-next-line prefer-const
      let [header, regex] = this.options.filter.split('=');
      const isNot = header.startsWith('-');
      if (isNot) header = header.slice(1);
      const col = this.findColumnFromHeader(header);
      if (!col || !regex) throw new Error('Filter flag has an invalid value');
      rows = rows.filter((d) => {
        const re = new RegExp(regex);
        const val = d[col.key] as string;
        const match = val.match(re);
        return isNot ? !match : match;
      });
    }

    // sort rows
    if (this.options.sort) {
      const sorters = this.options.sort.split(',');
      const sortHeaders = sorters.map((k) => (k.startsWith('-') ? k.slice(1) : k));
      const sortKeys = this.filterColumnsFromHeaders(sortHeaders).map(
        (c) =>
          (v: Record<string, unknown>): unknown =>
            v[c.key]
      );
      const sortKeysOrder = sorters.map((k) => (k.startsWith('-') ? 'desc' : 'asc'));
      rows = orderBy(rows, sortKeys, sortKeysOrder);
    }

    // and filter columns
    if (this.options.columns) {
      const filters = this.options.columns.split(',');
      this.columns = this.filterColumnsFromHeaders(filters);
    } else if (!this.options.extended) {
      // show extended columns/properties
      this.columns = this.columns.filter((c) => !c.extended);
    }

    this.data = rows;
  }

  public display(): void {
    switch (this.options.output) {
      case 'csv': {
        this.outputCSV();
        break;
      }

      case 'json': {
        this.outputJSON();
        break;
      }

      case 'yaml': {
        this.outputYAML();
        break;
      }

      default: {
        this.outputTable();
      }
    }
  }

  private filterColumnsFromHeaders(
    filters: string[]
  ): Array<Column<T> & { key: string; maxWidth?: number; width?: number }> {
    const cols: Array<Column<T> & { key: string; maxWidth?: number; width?: number }> = [];
    for (const f of [...new Set(filters)]) {
      const c = this.columns.find((i) => i.header.toLowerCase() === f.toLowerCase());
      if (c) cols.push(c);
    }

    return cols;
  }

  private findColumnFromHeader(
    header: string
  ): (Column<T> & { key: string; maxWidth?: number; width?: number }) | undefined {
    return this.columns.find((c) => c.header.toLowerCase() === header.toLowerCase());
  }

  private getCSVRow(d: Record<string, unknown>): string[] {
    const values = this.columns.map((col) => d[col.key] || '') as string[];
    const lineToBeEscaped = values.find(
      (e: string) => e.includes('"') || e.includes('\n') || e.includes('\r\n') || e.includes('\r') || e.includes(',')
    );
    return values.map((e) => (lineToBeEscaped ? `"${e.replaceAll('"', '""')}"` : e));
  }

  private outputCSV(): void {
    const { columns, data, options } = this;

    if (!options['no-header']) {
      options.printLine(columns.map((c) => c.header).join(','));
    }

    for (const d of data) {
      const row = this.getCSVRow(d);
      options.printLine(row.join(','));
    }
  }

  private outputJSON(): void {
    this.options.printLine(JSON.stringify(this.resolveColumnsToObjectArray(), undefined, 2));
  }

  private outputTable(): void {
    const { data, options } = this;
    // column truncation
    //
    // find max width for each column
    const columns = this.columns.map((c) => {
      const maxWidth = Math.max(sw('.'.padEnd(c.minWidth - 1)), sw(c.header), getWidestColumnWith(data, c.key)) + 1;
      return {
        ...c,
        maxWidth,
        width: maxWidth,
      };
    });

    // terminal width
    const maxWidth = stdtermwidth - 2;
    // truncation logic
    const shouldShorten = (): void => {
      // don't shorten if full mode
      if (options['no-truncate'] ?? (!process.stdout.isTTY && !process.env.CLI_UX_SKIP_TTY_CHECK)) return;

      // don't shorten if there is enough screen width
      const dataMaxWidth = sumBy(columns, (c) => c.width);
      const overWidth = dataMaxWidth - maxWidth;
      if (overWidth <= 0) return;

      // not enough room, short all columns to minWidth
      for (const col of columns) {
        col.width = col.minWidth;
      }

      // if sum(minWidth's) is greater than term width
      // nothing can be done so
      // display all as minWidth
      const dataMinWidth = sumBy(columns, (c) => c.minWidth);
      if (dataMinWidth >= maxWidth) return;

      // some wiggle room left, add it back to "needy" columns
      let wiggleRoom = maxWidth - dataMinWidth;
      const needyCols = columns
        .map((c) => ({ key: c.key, needs: c.maxWidth - c.width }))
        .sort((a, b) => a.needs - b.needs);
      for (const { key, needs } of needyCols) {
        if (!needs) continue;
        const col = columns.find((c) => key === c.key);
        if (!col) continue;
        if (wiggleRoom > needs) {
          col.width = col.width + needs;
          wiggleRoom -= needs;
        } else if (wiggleRoom) {
          col.width = col.width + wiggleRoom;
          wiggleRoom = 0;
        }
      }
    };

    shouldShorten();

    // print table title
    if (options.title) {
      options.printLine(options.title);
      // print title divider
      options.printLine(
        ''.padEnd(
          columns.reduce((sum, col) => sum + col.width, 1),
          '='
        )
      );

      options.rowStart = '| ';
    }

    // print headers
    if (!options['no-header']) {
      let headers = options.rowStart;
      for (const col of columns) {
        const header = col.header;
        headers += header.padEnd(col.width);
      }

      options.printLine(chalk.bold(headers));

      // print header dividers
      let dividers = options.rowStart;
      for (const col of columns) {
        const divider = ''.padEnd(col.width - 1, '─') + ' ';
        dividers += divider.padEnd(col.width);
      }

      options.printLine(chalk.bold(dividers));
    }

    // print rows
    for (const row of data) {
      // find max number of lines
      // for all cells in a row
      // with multi-line strings
      let numOfLines = 1;
      for (const col of columns) {
        const d = row[col.key] as string;
        const lines = d.split('\n').length;
        if (lines > numOfLines) numOfLines = lines;
      }

      // eslint-disable-next-line unicorn/no-new-array
      const linesIndexess = [...new Array(numOfLines).keys()];

      // print row
      // including multi-lines
      for (const i of linesIndexess) {
        let l = options.rowStart;
        for (const col of columns) {
          const width = col.width;
          let d = row[col.key] as string;
          d = d.split('\n')[i] || '';
          const visualWidth = sw(d);
          const colorWidth = d.length - visualWidth;
          let cell = d.padEnd(width + colorWidth);
          if (cell.length - colorWidth > width || visualWidth === width) {
            // truncate the cell, preserving ANSI escape sequences, and keeping
            // into account the width of fullwidth unicode characters
            cell = sliceAnsi(cell, 0, width - 2) + '… ';
            // pad with spaces; this is necessary in case the original string
            // contained fullwidth characters which cannot be split
            cell += ' '.repeat(width - sw(cell));
          }

          l += cell;
        }

        options.printLine(l);
      }
    }
  }

  private outputYAML(): void {
    this.options.printLine(jsyaml.dump(this.resolveColumnsToObjectArray()));
  }

  private resolveColumnsToObjectArray(): Array<Record<string, unknown>> {
    const { columns, data } = this;
    return data.map((d) => Object.fromEntries(columns.map((col) => [col.key, d[col.key] ?? ''])));
  }
}

export function table<T extends Record<string, unknown>>(data: T[], columns: Columns<T>, options: Options = {}): void {
  new Table(data, columns, options).display();
}

export type Column<T extends Record<string, unknown>> = {
  extended: boolean;
  header: string;
  minWidth: number;
  get(row: T): unknown;
};

export type Columns<T extends Record<string, unknown>> = { [key: string]: Partial<Column<T>> };

export type Options = {
  [key: string]: unknown;
  columns?: string;
  extended?: boolean;
  filter?: string;
  'no-header'?: boolean;
  'no-truncate'?: boolean;
  output?: string;
  rowStart?: string;
  sort?: string;
  title?: string;
  printLine?(s: unknown): void;
};

const getWidestColumnWith = (data: Array<Record<string, unknown>>, columnKey: string): number =>
  data.reduce((previous, current) => {
    const d = current[columnKey];
    if (typeof d !== 'string') return previous;
    // convert multi-line cell to single longest line
    // for width calculations
    const manyLines = d.split('\n');
    return Math.max(previous, manyLines.length > 1 ? Math.max(...manyLines.map((r: string) => sw(r))) : sw(d));
  }, 0);
