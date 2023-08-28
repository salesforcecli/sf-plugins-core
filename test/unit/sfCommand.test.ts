/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Flags, Interfaces } from '@oclif/core';
import { Lifecycle } from '@salesforce/core';
import { TestContext } from '@salesforce/core/lib/testSetup';
import { stubMethod } from '@salesforce/ts-sinon';
import { expect } from 'chai';
import { SfError } from '@salesforce/core';
import { SfCommand } from '../../src/sfCommand';

class TestCommand extends SfCommand<void> {
  public static readonly flags = {
    actions: Flags.boolean({ char: 'a', description: 'show actions' }),
    error: Flags.boolean({ char: 'e', description: 'throw an error' }),
    warn: Flags.boolean({ char: 'w', description: 'throw a warning' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(TestCommand);

    if (flags.error && !flags.warn) {
      const infoError = new SfError('foo bar baz', 'FooError', flags.actions ? ['this', 'is an', 'action'] : undefined);
      this.info(infoError);
    } else if (flags.warn) {
      if (flags.error) {
        const warnError = new SfError(
          'foo bar baz',
          'FooError',
          flags.actions ? ['this', 'is an', 'action'] : undefined
        );
        this.warn(warnError);
      } else {
        this.warn('foo bar baz');
      }
    } else {
      this.info('foo bar baz');
    }
  }
}

class NonJsonCommand extends SfCommand<void> {
  public static enableJsonFlag = false;
  public async run(): Promise<void> {
    await this.parse(TestCommand);
  }
}
describe('jsonEnabled', () => {
  beforeEach(() => {
    delete process.env.SF_CONTENT_TYPE;
  });

  const oclifConfig = {} as unknown as Interfaces.Config;
  it('not json', () => {
    // @ts-expect-error not really an oclif config
    const cmd = new TestCommand([], oclifConfig);
    expect(cmd.jsonEnabled()).to.be.false;
  });
  it('json via flag but not env', () => {
    // @ts-expect-error not really an oclif config
    const cmd = new TestCommand(['--json'], oclifConfig);
    expect(cmd.jsonEnabled()).to.be.true;
  });
  it('json via env but not flag', () => {
    process.env.SF_CONTENT_TYPE = 'JSON';
    // @ts-expect-error not really an oclif config
    const cmd = new TestCommand([], oclifConfig);
    expect(cmd.jsonEnabled()).to.be.true;
  });
  it('json via env lowercase', () => {
    process.env.SF_CONTENT_TYPE = 'json';
    // @ts-expect-error not really an oclif config
    const cmd = new TestCommand([], oclifConfig);
    expect(cmd.jsonEnabled()).to.be.true;
  });
  it('not json via env that is not json', () => {
    process.env.SF_CONTENT_TYPE = 'foo';
    // @ts-expect-error not really an oclif config
    const cmd = new TestCommand([], oclifConfig);
    expect(cmd.jsonEnabled()).to.be.false;
  });
  it('json via both flag and env', () => {
    process.env.SF_CONTENT_TYPE = 'JSON';
    // @ts-expect-error not really an oclif config
    const cmd = new TestCommand(['--json'], oclifConfig);
    expect(cmd.jsonEnabled()).to.be.true;
  });

  describe('non json command', () => {
    it('non-json command base case', () => {
      // @ts-expect-error not really an oclif config
      const cmd = new NonJsonCommand([], oclifConfig);
      expect(cmd.jsonEnabled()).to.be.false;
    });
    it('non-json command is not affected by env', () => {
      process.env.SF_CONTENT_TYPE = 'JSON';
      // @ts-expect-error not really an oclif config
      const cmd = new NonJsonCommand([], oclifConfig);
      expect(cmd.jsonEnabled()).to.be.false;
    });
  });
});

describe('info messages', () => {
  const $$ = new TestContext();
  beforeEach(() => {
    stubMethod($$.SANDBOX, Lifecycle, 'getInstance').returns({
      on: $$.SANDBOX.stub(),
      onWarning: $$.SANDBOX.stub(),
    });
  });

  it('should show a info message from a string', async () => {
    const infoStub = stubMethod($$.SANDBOX, SfCommand.prototype, 'info');
    await TestCommand.run([]);
    expect(infoStub.calledWith('foo bar baz')).to.be.true;
  });

  it('should show a info message from Error, no actions', async () => {
    const logStub = stubMethod($$.SANDBOX, SfCommand.prototype, 'log');
    await TestCommand.run(['--error']);
    expect(logStub.firstCall.firstArg).to.include('foo bar baz');
  });

  it('should show a info message, with actions', async () => {
    const logStub = stubMethod($$.SANDBOX, SfCommand.prototype, 'log');
    await TestCommand.run(['--error', '--actions']);
    expect(logStub.firstCall.firstArg)
      .to.include('foo bar baz')
      .and.to.include('this')
      .and.to.include('is an')
      .and.to.include('action');
  });
});

describe('warning messages', () => {
  const $$ = new TestContext();
  beforeEach(() => {
    stubMethod($$.SANDBOX, Lifecycle, 'getInstance').returns({
      on: $$.SANDBOX.stub(),
      onWarning: $$.SANDBOX.stub(),
    });
  });

  it('should show a info message from a string', async () => {
    const logToStderrStub = stubMethod($$.SANDBOX, SfCommand.prototype, 'logToStderr');
    await TestCommand.run(['--warn']);
    expect(logToStderrStub.firstCall.firstArg).to.include('Warning').and.to.include('foo bar baz');
  });

  it('should show a warning message from Error, no actions', async () => {
    const logToStderrStub = stubMethod($$.SANDBOX, SfCommand.prototype, 'logToStderr');
    await TestCommand.run(['--warn', '--error']);
    expect(logToStderrStub.firstCall.firstArg).to.include('Warning').and.to.include('foo bar baz');
  });

  it('should show a info message from Error, with actions', async () => {
    const logToStderrStub = stubMethod($$.SANDBOX, SfCommand.prototype, 'logToStderr');
    await TestCommand.run(['--warn', '--error', '--actions']);
    expect(logToStderrStub.firstCall.firstArg)
      .to.include('Warning')
      .and.to.include('foo bar baz')
      .and.to.include('this')
      .and.to.include('is an')
      .and.to.include('action');
  });
});
