/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import stripAnsi from 'strip-ansi';
import { table } from '../../../src/ux/table.js';

describe('table', () => {
  let output = '';
  function printLine(line: string) {
    output += stripAnsi(line) + '\n';
  }

  afterEach(() => {
    output = '';
  });

  it('does not exceed stack depth on very tall tables', () => {
    const data = Array.from({ length: 150_000 }).fill({ id: '123', name: 'foo', value: 'bar' }) as Array<
      Record<string, unknown>
    >;
    const tallColumns = {
      id: { header: 'ID' },
      name: {},
      value: { header: 'TEST' },
    };

    table(data, tallColumns, { printLine });
    expect(output).to.include('ID');
  });

  it('does not exceed stack depth on very tall, wide tables', () => {
    const columnsLength = 100;
    const row = Object.fromEntries(Array.from({ length: columnsLength }).map((_, i) => [`col${i}`, 'foo']));
    const data = Array.from({ length: 150_000 }).fill(row) as Array<Record<string, unknown>>;
    const bigColumns = Object.fromEntries(
      Array.from({ length: columnsLength }).map((_, i) => [`col${i}`, { header: `col${i}`.toUpperCase() }])
    );

    table(data, bigColumns, { printLine });
    expect(output).to.include('COL1');
  });
});
