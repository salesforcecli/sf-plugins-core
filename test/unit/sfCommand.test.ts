/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// import * as os from 'os';
// import { test } from '@oclif/test';
import { Flags } from '@oclif/core';
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
      const infoError = new SfError('foo bar baz', 'FooError', flags.actions ? ['this', 'is an', 'action'] : null);
      this.info(infoError);
    } else if (flags.warn) {
      if (flags.error) {
        const warnError = new SfError('foo bar baz', 'FooError', flags.actions ? ['this', 'is an', 'action'] : null);
        this.warn(warnError);
      } else {
        this.warn('foo bar baz');
      }
    } else {
      this.info('foo bar baz');
    }
  }
}

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
