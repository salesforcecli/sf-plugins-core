/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import stripAnsi from 'strip-ansi';
import { table } from '../../../src/ux/table.js';

/* eslint-disable camelcase */
const apps = [
  {
    build_stack: {
      id: '123',
      name: 'heroku-16',
    },
    created_at: '2000-01-01T22:34:46Z',
    id: '123',
    git_url: 'https://git.heroku.com/supertable-test-1.git',
    name: 'supertable-test-1',
    owner: {
      email: 'example@heroku.com',
      id: '1',
    },
    region: { id: '123', name: 'us' },
    released_at: '2000-01-01T22:34:46Z',
    stack: {
      id: '123',
      name: 'heroku-16',
    },
    updated_at: '2000-01-01T22:34:46Z',
    web_url: 'https://supertable-test-1.herokuapp.com/',
  },
  {
    build_stack: {
      id: '321',
      name: 'heroku-16',
    },
    created_at: '2000-01-01T22:34:46Z',
    id: '321',
    git_url: 'https://git.heroku.com/phishing-demo.git',
    name: 'supertable-test-2',
    owner: {
      email: 'example@heroku.com',
      id: '1',
    },
    region: { id: '321', name: 'us' },
    released_at: '2000-01-01T22:34:46Z',
    stack: {
      id: '321',
      name: 'heroku-16',
    },
    updated_at: '2000-01-01T22:34:46Z',
    web_url: 'https://supertable-test-2.herokuapp.com/',
  },
];

const columns = {
  id: { header: 'ID' },
  name: {},
  web_url: { extended: true },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  stack: { extended: true, get: (r: any) => r.stack?.name },
};

const ws = ' ';

describe('table', () => {
  let output = '';
  function printLine(line: string) {
    output += stripAnsi(line) + '\n';
  }

  afterEach(() => {
    output = '';
  });

  // This can't be in the unit tests since wireit changes process.stdout.isTTY, which alters the behavior of table
  it('should not truncate in TTY env', () => {
    const three = { ...apps[0], id: '0'.repeat(80), name: 'supertable-test-3' };
    table([...apps, three], columns, { filter: 'id=0', printLine, truncate: false });
    expect(output).to.equal(` ID${ws.padEnd(78)} Name${ws.padEnd(14)}
 ${''.padEnd(three.id.length, '─')} ─────────────────${ws}
 ${three.id} supertable-test-3${ws}\n`);
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

  // skip because it's too slow
  it.skip('does not exceed stack depth on very tall, wide tables', () => {
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
