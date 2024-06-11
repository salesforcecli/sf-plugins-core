/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Flags } from '@oclif/core';
import { Lifecycle } from '@salesforce/core';
import { TestContext } from '@salesforce/core/testSetup';
import { assert, expect } from 'chai';
import { SfError } from '@salesforce/core';
import { Config } from '@oclif/core/interfaces';
import { SfCommand } from '../../src/sfCommand.js';
import { SfCommandError } from '../../src/SfCommandError.js';
import { StandardColors } from '../../src/ux/standardColors.js';
import { stubSfCommandUx, stubSpinner } from '../../src/stubUx.js';

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

const errCause = new Error('the error cause');
const errActions = ['action1', 'action2'];
const errData = { prop1: 'foo', prop2: 'bar' };

// A Command that will throw different kinds of errors to ensure
// consistent error behavior.
class TestCommandErrors extends SfCommand<void> {
  public static buildFullError = () => {
    const err = new Error('full Error message');
    err.name = 'FullErrorName';
    err.cause = errCause;
    return err;
  };

  public static buildFullSfError = () =>
    SfError.create({
      message: 'full SfError message',
      name: 'FullSfErrorName',
      actions: errActions,
      context: 'TestCmdError', // purposely different from the default
      exitCode: 69,
      cause: errCause,
      data: errData,
    });

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public static errors: { [x: string]: Error } = {
    error: new Error('error message'),
    sfError: new SfError('sfError message'),
    fullError: TestCommandErrors.buildFullError(),
    fullSfError: TestCommandErrors.buildFullSfError(),
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public static readonly flags = {
    error: Flags.string({
      char: 'e',
      description: 'throw this error',
      required: true,
      options: Object.keys(TestCommandErrors.errors),
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(TestCommandErrors);
    throw TestCommandErrors.errors[flags.error];
  }
}

class NonJsonCommand extends SfCommand<void> {
  public static enableJsonFlag = false;
  public async run(): Promise<void> {
    await this.parse(NonJsonCommand);
  }
}

describe('jsonEnabled', () => {
  afterEach(() => {
    delete process.env.SF_CONTENT_TYPE;
  });

  const oclifConfig = {} as unknown as Config;
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
    // @ts-expect-error partial stub
    $$.SANDBOX.stub(Lifecycle, 'getInstance').returns({
      on: $$.SANDBOX.stub(),
      onWarning: $$.SANDBOX.stub(),
    });
  });

  it('should show a info message from a string', async () => {
    const infoStub = $$.SANDBOX.stub(SfCommand.prototype, 'info');
    await TestCommand.run([]);
    expect(infoStub.calledWith('foo bar baz')).to.be.true;
  });

  it('should show a info message from Error, no actions', async () => {
    const logStub = $$.SANDBOX.stub(SfCommand.prototype, 'log');
    await TestCommand.run(['--error']);
    expect(logStub.firstCall.firstArg).to.include('foo bar baz');
  });

  it('should show a info message, with actions', async () => {
    const logStub = $$.SANDBOX.stub(SfCommand.prototype, 'log');
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
    // @ts-expect-error partial stub
    $$.SANDBOX.stub(Lifecycle, 'getInstance').returns({
      on: $$.SANDBOX.stub(),
      onWarning: $$.SANDBOX.stub(),
    });
  });

  it('should show a info message from a string', async () => {
    const logToStderrStub = $$.SANDBOX.stub(SfCommand.prototype, 'logToStderr');
    await TestCommand.run(['--warn']);
    expect(logToStderrStub.firstCall.firstArg).to.include('Warning').and.to.include('foo bar baz');
  });

  it('should show a warning message from Error, no actions', async () => {
    const logToStderrStub = $$.SANDBOX.stub(SfCommand.prototype, 'logToStderr');
    await TestCommand.run(['--warn', '--error']);
    expect(logToStderrStub.firstCall.firstArg).to.include('Warning').and.to.include('foo bar baz');
  });

  it('should show a info message from Error, with actions', async () => {
    const logToStderrStub = $$.SANDBOX.stub(SfCommand.prototype, 'logToStderr');
    await TestCommand.run(['--warn', '--error', '--actions']);
    expect(logToStderrStub.firstCall.firstArg)
      .to.include('Warning')
      .and.to.include('foo bar baz')
      .and.to.include('this')
      .and.to.include('is an')
      .and.to.include('action');
  });
});

describe('error standardization', () => {
  const $$ = new TestContext();

  let sfCommandErrorData: [Error?, string?];
  const sfCommandErrorCb = (err: Error, cmdId: string) => {
    sfCommandErrorData = [err, cmdId];
  };

  beforeEach(() => {
    sfCommandErrorData = [];
    process.on('sfCommandError', sfCommandErrorCb);
  });

  afterEach(() => {
    process.removeListener('sfCommandError', sfCommandErrorCb);
  });

  it('should log correct error when command throws an Error', async () => {
    const logToStderrStub = $$.SANDBOX.stub(SfCommand.prototype, 'logToStderr');
    try {
      await TestCommandErrors.run(['--error', 'error']);
      expect(false, 'error should have been thrown').to.be.true;
    } catch (e: unknown) {
      expect(e).to.be.instanceOf(SfCommandError);
      const err = e as SfCommand.Error;

      // Ensure the error was logged to the console
      expect(logToStderrStub.callCount).to.equal(1);
      expect(logToStderrStub.firstCall.firstArg).to.contain(err.message);

      // Ensure the error has expected properties
      expect(err).to.have.property('actions', undefined);
      expect(err).to.have.property('exitCode', 1);
      expect(err).to.have.property('context', 'TestCommandErrors');
      expect(err).to.have.property('data', undefined);
      expect(err).to.have.property('cause').and.be.ok;
      expect(err).to.have.property('code', '1');
      expect(err).to.have.property('status', 1);
      expect(err).to.have.property('stack').and.be.ok;
      expect(err).to.have.property('skipOclifErrorHandling', true);
      expect(err).to.have.deep.property('oclif', { exit: 1 });

      // Ensure a sfCommandError event was emitted with the expected data
      expect(sfCommandErrorData[0]).to.equal(err);
      expect(sfCommandErrorData[1]).to.equal('testcommanderrors');
    }
  });

  it('should log correct error when command throws an Error --json', async () => {
    const logJsonStub = $$.SANDBOX.stub(SfCommand.prototype, 'logJson');
    try {
      await TestCommandErrors.run(['--error', 'error', '--json']);
      expect(false, 'error should have been thrown').to.be.true;
    } catch (e: unknown) {
      expect(e).to.be.instanceOf(SfCommandError);
      const err = e as SfCommand.Error;

      // Ensure the error was logged to the console
      expect(logJsonStub.callCount).to.equal(1);
      expect(logJsonStub.firstCall.firstArg).to.deep.equal(err.toJson());

      // Ensure the error has expected properties
      expect(err).to.have.property('actions', undefined);
      expect(err).to.have.property('exitCode', 1);
      expect(err).to.have.property('context', 'TestCommandErrors');
      expect(err).to.have.property('data', undefined);
      expect(err).to.have.property('cause').and.be.ok;
      expect(err).to.have.property('code', '1');
      expect(err).to.have.property('status', 1);
      expect(err).to.have.property('stack').and.be.ok;
      expect(err).to.have.property('skipOclifErrorHandling', true);
      expect(err).to.have.deep.property('oclif', { exit: 1 });

      // Ensure a sfCommandError event was emitted with the expected data
      expect(sfCommandErrorData[0]).to.equal(err);
      expect(sfCommandErrorData[1]).to.equal('testcommanderrors');
    }
  });

  it('should log correct error when command throws an SfError', async () => {
    const logToStderrStub = $$.SANDBOX.stub(SfCommand.prototype, 'logToStderr');
    try {
      await TestCommandErrors.run(['--error', 'sfError']);
      expect(false, 'error should have been thrown').to.be.true;
    } catch (e: unknown) {
      expect(e).to.be.instanceOf(SfCommandError);
      const err = e as SfCommand.Error;

      // Ensure the error was logged to the console
      expect(logToStderrStub.callCount).to.equal(1);
      expect(logToStderrStub.firstCall.firstArg).to.contain(err.message);

      // Ensure the error has expected properties
      expect(err).to.have.property('actions', undefined);
      expect(err).to.have.property('exitCode', 1);
      expect(err).to.have.property('context', 'TestCommandErrors');
      expect(err).to.have.property('data', undefined);
      expect(err).to.have.property('cause', undefined);
      expect(err).to.have.property('code', 'SfError');
      expect(err).to.have.property('status', 1);
      expect(err).to.have.property('stack').and.be.ok;
      expect(err).to.have.property('skipOclifErrorHandling', true);
      expect(err).to.have.deep.property('oclif', { exit: 1 });

      // Ensure a sfCommandError event was emitted with the expected data
      expect(sfCommandErrorData[0]).to.equal(err);
      expect(sfCommandErrorData[1]).to.equal('testcommanderrors');
    }
  });

  it('should log correct error when command throws an SfError --json', async () => {
    const logJsonStub = $$.SANDBOX.stub(SfCommand.prototype, 'logJson');
    try {
      await TestCommandErrors.run(['--error', 'sfError', '--json']);
      expect(false, 'error should have been thrown').to.be.true;
    } catch (e: unknown) {
      expect(e).to.be.instanceOf(SfCommandError);
      const err = e as SfCommand.Error;

      // Ensure the error was logged to the console
      expect(logJsonStub.callCount).to.equal(1);
      expect(logJsonStub.firstCall.firstArg).to.deep.equal(err.toJson());

      // Ensure the error has expected properties
      expect(err).to.have.property('name', 'SfError');
      expect(err).to.have.property('actions', undefined);
      expect(err).to.have.property('exitCode', 1);
      expect(err).to.have.property('context', 'TestCommandErrors');
      expect(err).to.have.property('data', undefined);
      expect(err).to.have.property('cause', undefined);
      expect(err).to.have.property('code', 'SfError');
      expect(err).to.have.property('status', 1);
      expect(err).to.have.property('stack').and.be.ok;
      expect(err).to.have.property('skipOclifErrorHandling', true);
      expect(err).to.have.deep.property('oclif', { exit: 1 });

      // Ensure a sfCommandError event was emitted with the expected data
      expect(sfCommandErrorData[0]).to.equal(err);
      expect(sfCommandErrorData[1]).to.equal('testcommanderrors');
    }
  });

  // A "full" Error has all props set allowed for an Error
  it('should log correct error when command throws a "full" Error', async () => {
    const logToStderrStub = $$.SANDBOX.stub(SfCommand.prototype, 'logToStderr');
    try {
      await TestCommandErrors.run(['--error', 'fullError']);
      expect(false, 'error should have been thrown').to.be.true;
    } catch (e: unknown) {
      expect(e).to.be.instanceOf(SfCommandError);
      const err = e as SfCommand.Error;

      // Ensure the error was logged to the console
      expect(logToStderrStub.callCount).to.equal(1);
      expect(logToStderrStub.firstCall.firstArg).to.contain(err.message);

      // Ensure the error has expected properties
      expect(err).to.have.property('name', 'FullErrorName');
      expect(err).to.have.property('actions', undefined);
      expect(err).to.have.property('exitCode', 1);
      expect(err).to.have.property('context', 'TestCommandErrors');
      expect(err).to.have.property('data', undefined);
      // SfError.wrap() sets the original error as the cause
      expect(err.cause).to.have.property('name', 'FullErrorName');
      expect(err.cause).to.have.property('cause', errCause);
      expect(err).to.have.property('code', '1');
      expect(err).to.have.property('status', 1);
      expect(err).to.have.property('stack').and.be.ok;
      expect(err).to.have.property('skipOclifErrorHandling', true);
      expect(err).to.have.deep.property('oclif', { exit: 1 });

      // Ensure a sfCommandError event was emitted with the expected data
      expect(sfCommandErrorData[0]).to.equal(err);
      expect(sfCommandErrorData[1]).to.equal('testcommanderrors');
    }
  });

  // A "full" Error has all props set allowed for an Error
  it('should log correct error when command throws a "full" Error --json', async () => {
    const logJsonStub = $$.SANDBOX.stub(SfCommand.prototype, 'logJson');
    try {
      await TestCommandErrors.run(['--error', 'fullError', '--json']);
      expect(false, 'error should have been thrown').to.be.true;
    } catch (e: unknown) {
      expect(e).to.be.instanceOf(SfCommandError);
      const err = e as SfCommand.Error;

      // Ensure the error was logged to the console
      expect(logJsonStub.callCount).to.equal(1);
      expect(logJsonStub.firstCall.firstArg).to.deep.equal(err.toJson());

      // Ensure the error has expected properties
      expect(err).to.have.property('name', 'FullErrorName');
      expect(err).to.have.property('actions', undefined);
      expect(err).to.have.property('exitCode', 1);
      expect(err).to.have.property('context', 'TestCommandErrors');
      expect(err).to.have.property('data', undefined);
      // SfError.wrap() sets the original error as the cause
      expect(err.cause).to.have.property('name', 'FullErrorName');
      expect(err.cause).to.have.property('cause', errCause);
      expect(err).to.have.property('code', '1');
      expect(err).to.have.property('status', 1);
      expect(err).to.have.property('stack').and.be.ok;
      expect(err).to.have.property('skipOclifErrorHandling', true);
      expect(err).to.have.deep.property('oclif', { exit: 1 });

      // Ensure a sfCommandError event was emitted with the expected data
      expect(sfCommandErrorData[0]).to.equal(err);
      expect(sfCommandErrorData[1]).to.equal('testcommanderrors');
    }
  });

  // A "full" SfError has all props set allowed for an SfError
  it('should log correct error when command throws a "full" SfError', async () => {
    const logToStderrStub = $$.SANDBOX.stub(SfCommand.prototype, 'logToStderr');
    try {
      await TestCommandErrors.run(['--error', 'fullSfError']);
      expect(false, 'error should have been thrown').to.be.true;
    } catch (e: unknown) {
      expect(e).to.be.instanceOf(SfCommandError);
      const err = e as SfCommand.Error;

      // Ensure the error was logged to the console
      expect(logToStderrStub.callCount).to.equal(1);
      expect(logToStderrStub.firstCall.firstArg).to.contain(err.message);

      // Ensure the error has expected properties
      expect(err).to.have.property('name', 'FullSfErrorName');
      expect(err).to.have.property('actions', errActions);
      expect(err).to.have.property('exitCode', 69);
      expect(err).to.have.property('context', 'TestCmdError');
      expect(err).to.have.property('data', errData);
      expect(err).to.have.property('cause', errCause);
      expect(err).to.have.property('code', 'FullSfErrorName');
      expect(err).to.have.property('status', 69);
      expect(err).to.have.property('stack').and.be.ok;
      expect(err).to.have.property('skipOclifErrorHandling', true);
      expect(err).to.have.deep.property('oclif', { exit: 69 });

      // Ensure a sfCommandError event was emitted with the expected data
      expect(sfCommandErrorData[0]).to.equal(err);
      expect(sfCommandErrorData[1]).to.equal('testcommanderrors');
    }
  });

  // A "full" SfError has all props set allowed for an SfError
  it('should log correct error when command throws a "full" SfError --json', async () => {
    const logJsonStub = $$.SANDBOX.stub(SfCommand.prototype, 'logJson');
    try {
      await TestCommandErrors.run(['--error', 'fullSfError', '--json']);
      expect(false, 'error should have been thrown').to.be.true;
    } catch (e: unknown) {
      expect(e).to.be.instanceOf(SfCommandError);
      const err = e as SfCommand.Error;

      // Ensure the error was logged to the console
      expect(logJsonStub.callCount).to.equal(1);
      expect(logJsonStub.firstCall.firstArg).to.deep.equal(err.toJson());

      // Ensure the error has expected properties
      expect(err).to.have.property('name', 'FullSfErrorName');
      expect(err).to.have.property('actions', errActions);
      expect(err).to.have.property('exitCode', 69);
      expect(err).to.have.property('context', 'TestCmdError');
      expect(err).to.have.property('data', errData);
      expect(err).to.have.property('cause', errCause);
      expect(err).to.have.property('code', 'FullSfErrorName');
      expect(err).to.have.property('status', 69);
      expect(err).to.have.property('stack').and.be.ok;
      expect(err).to.have.property('skipOclifErrorHandling', true);
      expect(err).to.have.deep.property('oclif', { exit: 69 });

      // Ensure a sfCommandError event was emitted with the expected data
      expect(sfCommandErrorData[0]).to.equal(err);
      expect(sfCommandErrorData[1]).to.equal('testcommanderrors');
    }
  });
});

describe('spinner stops on errors', () => {
  const $$ = new TestContext();

  class SpinnerThrow extends SfCommand<void> {
    // public static enableJsonFlag = true;
    public static flags = {
      throw: Flags.boolean(),
    };
    public async run(): Promise<void> {
      const { flags } = await this.parse(SpinnerThrow);
      this.spinner.start('go');
      if (flags.throw) {
        throw new Error('boo');
      }
    }
  }

  it("spinner stops but stop isn't called", async () => {
    const spinnerStub = stubSpinner($$.SANDBOX);
    stubSfCommandUx($$.SANDBOX);
    try {
      await SpinnerThrow.run(['--throw']);
      throw new Error('should have thrown');
    } catch (e) {
      assert(e instanceof Error);
      expect(e.message).to.equal('boo');
      expect(spinnerStub.start.callCount).to.equal(1);
      expect(spinnerStub.stop.callCount).to.equal(1);
      expect(spinnerStub.stop.firstCall.firstArg).to.equal(StandardColors.error('Error'));
    }
  });
  it('spinner not stopped when no throw', async () => {
    const spinnerStub = stubSpinner($$.SANDBOX);
    stubSfCommandUx($$.SANDBOX);
    await SpinnerThrow.run([]);

    expect(spinnerStub.start.callCount).to.equal(1);
    expect(spinnerStub.stop.callCount).to.equal(0);
  });
});
