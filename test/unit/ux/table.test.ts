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
const extendedHeader = `ID  Name${ws.padEnd(14)}Web url${ws.padEnd(34)}Stack${ws.padEnd(5)}`;

describe('table', () => {
  let output = '';
  function printLine(line: string) {
    output += stripAnsi(line) + '\n';
  }

  afterEach(() => {
    output = '';
  });

  it('should display a table', () => {
    table(apps, columns, { printLine });
    expect(output).to.equal(` ID  Name${ws.padEnd(14)}
 ─── ─────────────────${ws}
 123 supertable-test-1${ws}
 321 supertable-test-2${ws}\n`);
  });

  describe('columns', () => {
    it('should user header value for id', () => {
      table(apps, columns, { printLine });
      expect(output.slice(1, 3)).to.equal('ID');
    });

    it('should show extended columns and use get() for value', () => {
      table(apps, columns, { printLine, extended: true });
      expect(output).to.equal(`${ws}${extendedHeader}
 ─── ───────────────── ──────────────────────────────────────── ─────────${ws}
 123 supertable-test-1 https://supertable-test-1.herokuapp.com/ heroku-16${ws}
 321 supertable-test-2 https://supertable-test-2.herokuapp.com/ heroku-16${ws}\n`);
    });
  });

  it('should omit nulls and undefined by default', () => {
    const data = [{ a: 1, b: '2', c: null, d: undefined }];
    table(data, { a: {}, b: {}, c: {}, d: {} }, { printLine });
    expect(output).to.include('1');
    expect(output).to.include('2');
    expect(output).to.not.include('null');
    expect(output).to.not.include('undefined');
  });

  describe('options', () => {
    it('should show extended columns', () => {
      table(apps, columns, { printLine, extended: true });
      expect(output).to.contain(extendedHeader);
    });

    it('should show title with divider', () => {
      table(apps, columns, { printLine, title: 'testing' });
      expect(output).to.equal(`testing
=======================
| ID  Name${ws.padEnd(14)}
| ─── ─────────────────${ws}
| 123 supertable-test-1${ws}
| 321 supertable-test-2${ws}\n`);
    });

    it('should skip header', () => {
      table(apps, columns, { printLine, 'no-header': true });
      expect(output).to.equal(` 123 supertable-test-1${ws}
 321 supertable-test-2${ws}\n`);
    });

    it('should only display given columns', () => {
      table(apps, columns, { printLine, columns: 'id' });
      expect(output).to.equal(` ID${ws}${ws}
 ───${ws}
 123${ws}
 321${ws}\n`);
    });

    it('should output in csv', () => {
      table(apps, columns, { printLine, output: 'csv' });
      expect(output).to.equal(`ID,Name
123,supertable-test-1
321,supertable-test-2\n`);
    });

    it('should output in csv with escaped values', () => {
      table(
        [
          {
            id: '123\n2',
            name: 'supertable-test-1',
          },
          {
            id: '12"3',
            name: 'supertable-test-2',
          },
          {
            id: '1"2"3',
            name: 'supertable-test-3',
          },
          {
            id: '123',
            name: 'supertable-test-4,comma',
          },
          {
            id: '123',
            name: 'supertable-test-5',
          },
        ],
        columns,
        { output: 'csv', printLine }
      );
      expect(output).to.equal(`ID,Name
"123\n2","supertable-test-1"
"12""3","supertable-test-2"
"1""2""3","supertable-test-3"
"123","supertable-test-4,comma"
123,supertable-test-5\n`);
    });

    it('should output in csv without headers', () => {
      table(apps, columns, { printLine, output: 'csv', 'no-header': true });
      expect(output).to.equal(`123,supertable-test-1
321,supertable-test-2\n`);
    });

    it('should output in csv with alias flag', () => {
      table(apps, columns, { printLine, csv: true });
      expect(output).to.equal(`ID,Name
123,supertable-test-1
321,supertable-test-2\n`);
    });

    it('should output in json', () => {
      table(apps, columns, { printLine, output: 'json' });
      expect(output).to.equal(`[
  {
    "id": "123",
    "name": "supertable-test-1"
  },
  {
    "id": "321",
    "name": "supertable-test-2"
  }
]
`);
    });

    it('should output in yaml', () => {
      table(apps, columns, { printLine, output: 'yaml' });
      expect(output).to.equal(`- id: '123'
  name: supertable-test-1
- id: '321'
  name: supertable-test-2

`);
    });

    it('should sort by property', () => {
      table(apps, columns, { printLine, sort: '-name' });
      expect(output).to.equal(` ID  Name${ws.padEnd(14)}
 ─── ─────────────────${ws}
 321 supertable-test-2${ws}
 123 supertable-test-1${ws}\n`);
    });

    it('should filter by property and value (partial string match)', () => {
      table(apps, columns, { printLine, filter: 'id=123' });
      expect(output).to.equal(` ID  Name${ws.padEnd(14)}
 ─── ─────────────────${ws}
 123 supertable-test-1${ws}\n`);
    });

    // This test doesn't work because tests have process.stdout.isTTY=undefined when wireit runs the tests
    // `yarn mocha test` works fine since process.stdout.isTTY=true
    it.skip('should not truncate', () => {
      const three = { ...apps[0], id: '0'.repeat(80), name: 'supertable-test-3' };
      table([...apps, three], columns, { filter: 'id=0', printLine, truncate: false });
      expect(output).to.equal(` ID${ws.padEnd(78)} Name${ws.padEnd(14)}
 ${''.padEnd(three.id.length, '─')} ─────────────────${ws}
 ${three.id} supertable-test-3${ws}\n`);
    });
  });

  describe('edge cases', () => {
    it('ignores header case', () => {
      table(apps, columns, { columns: 'iD,Name', filter: 'nAMe=supertable-test', sort: '-ID', printLine });
      expect(output).to.equal(` ID  Name${ws.padEnd(14)}
 ─── ─────────────────${ws}
 321 supertable-test-2${ws}
 123 supertable-test-1${ws}\n`);
    });

    it('displays multiline cell', () => {
      const app3 = {
        build_stack: {
          name: 'heroku-16',
        },
        id: '456',
        name: 'supertable-test\n3',
        web_url: 'https://supertable-test-1.herokuapp.com/',
      };

      table([...apps, app3], columns, { sort: '-ID', printLine });
      expect(output).to.equal(` ID  Name${ws.padEnd(14)}
 ─── ─────────────────${ws}
 456 supertable-test${ws.padEnd(3)}
     3${ws.padEnd(17)}
 321 supertable-test-2${ws}
 123 supertable-test-1${ws}\n`);
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

    // Skip because it takes too long
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
});
