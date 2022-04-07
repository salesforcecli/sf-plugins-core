/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'os';
import { test } from '@oclif/test';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import { SfError } from '@salesforce/core';
import { SfCommand } from '../../src/sfCommand';

class TestCommand extends SfCommand<string> {
  public async run(): Promise<string> {
    return Promise.resolve('');
  }
}

describe('info messages', () => {
  test
    .stdout()
    .do(() => {
      const testCommand = new TestCommand([], {} as Config);
      testCommand.info('foo bar baz');
    })
    .it('should show a info message from a string', (ctx) => {
      expect(ctx.stdout).to.include('foo bar baz');
    });
  test
    .stdout()
    .do(() => {
      const testCommand = new TestCommand([], {} as Config);
      testCommand.info(new Error('foo bar baz') as SfCommand.Info);
    })
    .it('should show a info message from Error, no actions', (ctx) => {
      expect(ctx.stdout).to.include('foo bar baz');
    });
  test
    .stdout()
    .do(() => {
      const testCommand = new TestCommand([], {} as Config);
      const infoError = new SfError('foo bar baz', 'foo', ['this', 'is an', 'action']) as Error;
      testCommand.info(infoError as SfCommand.Info);
    })
    .it('should show a info message, with actions', (ctx) => {
      expect(ctx.stdout).to.include('foo bar baz');
      expect(ctx.stdout).to.include(['this', 'is an', 'action'].join(os.EOL));
    });
});
describe('warning messages', () => {
  test
    .stdout()
    .do(() => {
      const testCommand = new TestCommand([], {} as Config);
      testCommand.warn('foo bar baz');
    })
    .it('should show a info message from a string', (ctx) => {
      expect(ctx.stdout).to.include('Warning: foo bar baz');
    });
  test
    .stdout()
    .do(() => {
      const testCommand = new TestCommand([], {} as Config);
      testCommand.warn(new Error('foo bar baz') as SfCommand.Warning);
    })
    .it('should show a warning message from Error, no actions', (ctx) => {
      expect(ctx.stdout).to.include('Warning: foo bar baz');
    });
  test
    .stdout()
    .do(() => {
      const testCommand = new TestCommand([], {} as Config);
      const infoError = new SfError('foo bar baz', 'foo', ['this', 'is an', 'action']) as Error;
      testCommand.warn(infoError as SfCommand.Info);
    })
    .it('should show a info message from Error, with actions', (ctx) => {
      expect(ctx.stdout).to.include('Warning: foo bar baz');
      expect(ctx.stdout).to.include(['this', 'is an', 'action'].join(os.EOL));
    });
});
