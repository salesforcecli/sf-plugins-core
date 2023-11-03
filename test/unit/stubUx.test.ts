/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Interfaces } from '@oclif/core';
import { expect } from 'chai';
import { TestContext } from '@salesforce/core/lib/testSetup';
// import { stubMethod } from '@salesforce/ts-sinon';
import { Lifecycle } from '@salesforce/core';
import { stubUx, stubSfCommandUx, SfCommand, Ux, stubSpinner, Flags } from '../../src/exported';

const TABLE_DATA = Array.from({ length: 10 }).fill({ id: '123', name: 'foo', value: 'bar' }) as Array<
  Record<string, unknown>
>;
const TABLE_COLUMNS = {
  id: { header: 'ID' },
  name: {},
  value: { header: 'TEST' },
};

class Cmd extends SfCommand<void> {
  public static flags = {
    method: Flags.custom<'SfCommand' | 'Ux'>({
      options: ['SfCommand', 'Ux'],
    })({
      required: true,
    }),
    info: Flags.boolean(),
    log: Flags.boolean(),
    logSensitive: Flags.boolean(),
    logSuccess: Flags.boolean(),
    logToStderr: Flags.boolean(),
    spinner: Flags.boolean(),
    styledHeader: Flags.boolean(),
    styledJSON: Flags.boolean(),
    styledObject: Flags.boolean(),
    table: Flags.boolean(),
    url: Flags.boolean(),
    warn: Flags.boolean(),
  };

  private flags!: Interfaces.InferredFlags<typeof Cmd.flags>;

  public async run(): Promise<void> {
    const { flags } = await this.parse(Cmd);
    this.flags = flags;

    if (flags.info) this.runInfo();
    if (flags.log) this.runLog();
    if (flags.logSensitive) this.runLogSensitive();
    if (flags.logSuccess) this.runLogSuccess();
    if (flags.logToStderr) this.runLogToStderr();
    if (flags.spinner) this.runSpinner();
    if (flags.styledHeader) this.runStyledHeader();
    if (flags.styledJSON) this.runStyledJSON();
    if (flags.styledObject) this.runStyledObject();
    if (flags.table) this.runTable();
    if (flags.url) this.runUrl();
    if (flags.warn) this.runWarn();
  }

  private runInfo(): void {
    switch (this.flags.method) {
      case 'SfCommand':
        this.info('hello');
        break;
      case 'Ux':
        throw new Error('Ux.info is not implemented');
      default:
        throw new Error(`Invalid method: ${this.flags.method}`);
    }
    this.info('hello');
  }

  private runLog(): void {
    switch (this.flags.method) {
      case 'SfCommand':
        this.log('hello');
        break;
      case 'Ux':
        new Ux().log('hello');
        break;
      default:
        throw new Error(`Invalid method: ${this.flags.method}`);
    }
  }

  private runLogSuccess(): void {
    switch (this.flags.method) {
      case 'SfCommand':
        this.logSuccess('hello');
        break;
      case 'Ux':
        throw new Error('Ux.logSuccess is not implemented');
      default:
        throw new Error(`Invalid method: ${this.flags.method}`);
    }
  }

  private runLogSensitive(): void {
    switch (this.flags.method) {
      case 'SfCommand':
        this.logSensitive('hello');
        break;
      case 'Ux':
        throw new Error('Ux.logSensitive is not implemented');
      default:
        throw new Error(`Invalid method: ${this.flags.method}`);
    }
  }

  private runLogToStderr(): void {
    switch (this.flags.method) {
      case 'SfCommand':
        this.logToStderr('hello');
        break;
      case 'Ux':
        throw new Error('Ux.logToStderr is not implemented');
      default:
        throw new Error(`Invalid method: ${this.flags.method}`);
    }
  }

  private runWarn(): void {
    switch (this.flags.method) {
      case 'SfCommand':
        this.warn('hello');
        break;
      case 'Ux':
        new Ux().warn('hello');
        break;
      default:
        throw new Error(`Invalid method: ${this.flags.method}`);
    }
  }

  private runTable(): void {
    switch (this.flags.method) {
      case 'SfCommand':
        this.table(TABLE_DATA, TABLE_COLUMNS);
        break;
      case 'Ux':
        new Ux().table(TABLE_DATA, TABLE_COLUMNS);
        break;
      default:
        throw new Error(`Invalid method: ${this.flags.method}`);
    }
  }

  private runUrl(): void {
    switch (this.flags.method) {
      case 'SfCommand':
        this.url('oclif', 'https://oclif.io');
        break;
      case 'Ux':
        new Ux().url('oclif', 'https://oclif.io');
        break;
      default:
        throw new Error(`Invalid method: ${this.flags.method}`);
    }
  }

  private runStyledHeader(): void {
    switch (this.flags.method) {
      case 'SfCommand':
        this.styledHeader('hello');
        break;
      case 'Ux':
        new Ux().styledHeader('hello');
        break;
      default:
        throw new Error(`Invalid method: ${this.flags.method}`);
    }
  }

  private runStyledObject(): void {
    switch (this.flags.method) {
      case 'SfCommand':
        this.styledObject({ foo: 'bar' });
        break;
      case 'Ux':
        new Ux().styledObject({ foo: 'bar' });
        break;
      default:
        throw new Error(`Invalid method: ${this.flags.method}`);
    }
  }

  private runStyledJSON(): void {
    switch (this.flags.method) {
      case 'SfCommand':
        this.styledJSON({ foo: 'bar' });
        break;
      case 'Ux':
        new Ux().styledJSON({ foo: 'bar' });
        break;
      default:
        throw new Error(`Invalid method: ${this.flags.method}`);
    }
  }

  private runSpinner(): void {
    switch (this.flags.method) {
      case 'SfCommand':
        this.spinner.start('starting spinner');
        this.spinner.stop('done');
        break;
      case 'Ux':
        new Ux().spinner.start('starting spinner');
        new Ux().spinner.stop('done');
        break;
      default:
        throw new Error(`Invalid method: ${this.flags.method}`);
    }
  }
}

describe('Ux Stubs', () => {
  let uxStubs: ReturnType<typeof stubUx>;
  let sfCommandUxStubs: ReturnType<typeof stubSfCommandUx>;
  let spinnerStubs: ReturnType<typeof stubSpinner>;

  const $$ = new TestContext();

  beforeEach(() => {
    // @ts-expect-error not the full lifecycle class
    $$.SANDBOX.stub(Lifecycle, 'getInstance').returns({
      on: $$.SANDBOX.stub(),
      onWarning: $$.SANDBOX.stub(),
    });

    uxStubs = stubUx($$.SANDBOX);
    sfCommandUxStubs = stubSfCommandUx($$.SANDBOX);
    spinnerStubs = stubSpinner($$.SANDBOX);
  });

  describe('SfCommand methods', () => {
    it('should stub log', async () => {
      await Cmd.run(['--log', '--method=SfCommand']);
      expect(sfCommandUxStubs.log.firstCall.args).to.deep.equal(['hello']);
    });

    it('should stub logSuccess', async () => {
      await Cmd.run(['--logSuccess', '--method=SfCommand']);
      expect(sfCommandUxStubs.logSuccess.firstCall.args).to.deep.equal(['hello']);
    });

    it('should stub logSensitive', async () => {
      await Cmd.run(['--logSensitive', '--method=SfCommand']);
      expect(sfCommandUxStubs.logSensitive.firstCall.args).to.deep.equal(['hello']);
    });

    it('should stub logToStderr', async () => {
      await Cmd.run(['--logToStderr', '--method=SfCommand']);
      expect(sfCommandUxStubs.logToStderr.firstCall.args).to.deep.equal(['hello']);
    });

    it('should stub warn', async () => {
      await Cmd.run(['--warn', '--method=SfCommand']);
      expect(sfCommandUxStubs.warn.firstCall.args).to.deep.equal(['hello']);
    });

    it('should stub table', async () => {
      await Cmd.run(['--table', '--method=SfCommand']);
      expect(sfCommandUxStubs.table.firstCall.args).to.deep.equal([TABLE_DATA, TABLE_COLUMNS]);
    });

    it('should stub url', async () => {
      await Cmd.run(['--url', '--method=SfCommand']);
      expect(sfCommandUxStubs.url.firstCall.args).to.deep.equal(['oclif', 'https://oclif.io']);
    });

    it('should stub styledHeader', async () => {
      await Cmd.run(['--styledHeader', '--method=SfCommand']);
      expect(sfCommandUxStubs.styledHeader.firstCall.args).to.deep.equal(['hello']);
    });

    it('should stub styledObject', async () => {
      await Cmd.run(['--styledObject', '--method=SfCommand']);
      expect(sfCommandUxStubs.styledObject.firstCall.args).to.deep.equal([{ foo: 'bar' }]);
    });

    it('should stub styledJSON', async () => {
      await Cmd.run(['--styledJSON', '--method=SfCommand']);
      expect(sfCommandUxStubs.styledJSON.firstCall.args).to.deep.equal([{ foo: 'bar' }]);
    });

    it('should stub spinner', async () => {
      await Cmd.run(['--spinner', '--method=SfCommand']);
      expect(true).to.be.true;
      expect(spinnerStubs.start.firstCall.args).to.deep.equal(['starting spinner']);
      expect(spinnerStubs.stop.firstCall.args).to.deep.equal(['done']);
    });
  });

  describe('Ux methods run in SfCommand', () => {
    it('should stub log', async () => {
      await Cmd.run(['--log', '--method=Ux']);
      expect(uxStubs.log.firstCall.args).to.deep.equal(['hello']);
    });

    it('should stub warn', async () => {
      await Cmd.run(['--warn', '--method=Ux']);
      expect(uxStubs.warn.firstCall.args).to.deep.equal(['hello']);
    });

    it('should stub table', async () => {
      await Cmd.run(['--table', '--method=Ux']);
      expect(uxStubs.table.firstCall.args).to.deep.equal([TABLE_DATA, TABLE_COLUMNS]);
    });

    it('should stub url', async () => {
      await Cmd.run(['--url', '--method=Ux']);
      expect(uxStubs.url.firstCall.args).to.deep.equal(['oclif', 'https://oclif.io']);
    });

    it('should stub styledHeader', async () => {
      await Cmd.run(['--styledHeader', '--method=Ux']);
      expect(uxStubs.styledHeader.firstCall.args).to.deep.equal(['hello']);
    });

    it('should stub styledObject', async () => {
      await Cmd.run(['--styledObject', '--method=Ux']);
      expect(uxStubs.styledObject.firstCall.args).to.deep.equal([{ foo: 'bar' }]);
    });

    it('should stub styledJSON', async () => {
      await Cmd.run(['--styledJSON', '--method=Ux']);
      expect(uxStubs.styledJSON.firstCall.args).to.deep.equal([{ foo: 'bar' }]);
    });

    it('should stub spinner', async () => {
      await Cmd.run(['--spinner', '--method=Ux']);
      expect(spinnerStubs.start.firstCall.args).to.deep.equal(['starting spinner']);
      expect(spinnerStubs.stop.firstCall.args).to.deep.equal(['done']);
    });
  });
});
