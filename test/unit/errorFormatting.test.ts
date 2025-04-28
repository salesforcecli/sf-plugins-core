/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { Mode, SfError } from '@salesforce/core';
import { formatError } from '../../src/errorFormatting.js';
import { SfCommandError } from '../../src/SfCommandError.js';

describe('errorFormatting.formatError()', () => {
  afterEach(() => {
    delete process.env.SF_ENV;
  });

  it('should have correct output for non-development mode, no actions', () => {
    const err = SfCommandError.from(new Error('this did not work'), 'thecommand');
    const errorOutput = formatError(err);
    expect(errorOutput).to.contain('Error (1)');
    expect(errorOutput).to.contain('this did not work');
  });

  it('should have correct output for non-development mode, with actions', () => {
    const sfError = new SfError('this did not work', 'BadError');
    const err = SfCommandError.from(sfError, 'thecommand');
    err.actions = ['action1', 'action2'];
    const errorOutput = formatError(err);
    expect(errorOutput).to.contain('Error (BadError)');
    expect(errorOutput).to.contain('this did not work');
    expect(errorOutput).to.contain('Try this:');
    expect(errorOutput).to.contain('action1');
    expect(errorOutput).to.contain('action2');
  });

  it('should have correct output for development mode, basic error', () => {
    process.env.SF_ENV = Mode.DEVELOPMENT;
    const err = SfCommandError.from(new SfError('this did not work'), 'thecommand');
    const errorOutput = formatError(err);
    expect(errorOutput).to.contain('Error (SfError)');
    expect(errorOutput).to.contain('this did not work');
    expect(errorOutput).to.contain('*** Internal Diagnostic ***');
    expect(errorOutput).to.contain('at Function.from');
    expect(errorOutput).to.contain('actions: undefined');
    expect(errorOutput).to.contain('exitCode: 1');
    expect(errorOutput).to.contain("context: 'thecommand'");
    expect(errorOutput).to.contain('data: undefined');
    expect(errorOutput).to.contain('cause: undefined');
    expect(errorOutput).to.contain('status: 1');
    expect(errorOutput).to.contain("commandName: 'thecommand'");
    expect(errorOutput).to.contain('warnings: undefined');
    expect(errorOutput).to.contain('result: undefined');
  });

  it('should have correct output for development mode, full error', () => {
    process.env.SF_ENV = Mode.DEVELOPMENT;
    const sfError = SfError.create({
      name: 'WOMP_WOMP',
      message: 'this did not work',
      actions: ['action1', 'action2'],
      cause: new Error('this is the cause'),
      exitCode: 9,
      context: 'somecommand',
      data: { foo: 'bar' },
    });
    const err = SfCommandError.from(sfError, 'thecommand');
    const errorOutput = formatError(err);
    expect(errorOutput).to.contain('Error (WOMP_WOMP)');
    expect(errorOutput).to.contain('this did not work');
    expect(errorOutput).to.contain('*** Internal Diagnostic ***');
    expect(errorOutput).to.contain('at Function.from');
    expect(errorOutput).to.contain("actions: [ 'action1', 'action2' ]");
    expect(errorOutput).to.contain('exitCode: 9');
    expect(errorOutput).to.contain("context: 'somecommand'");
    expect(errorOutput).to.contain("data: { foo: 'bar' }");
    expect(errorOutput).to.contain('cause: Error: this is the cause');
    expect(errorOutput).to.contain('status: 9');
    expect(errorOutput).to.contain("commandName: 'thecommand'");
    expect(errorOutput).to.contain('warnings: undefined');
    expect(errorOutput).to.contain('result: undefined');
  });

  it('should have correct output for multiple errors in table format ', () => {
    const sfError = SfError.create({
      name: 'myError',
      message: 'foo',
      actions: ['bar'],
      context: 'myContext',
      exitCode: 8,
      data: [
        { errorCode: 'ERROR_1', message: 'error 1' },
        { errorCode: 'ERROR_2', message: 'error 2' },
      ],
    });
    const err = SfCommandError.from(sfError, 'thecommand');
    const errorOutput = formatError(err);
    expect(errorOutput).to.match(/Error Code.+Message/);
    expect(errorOutput).to.match(/ERROR_1.+error 1/);
    expect(errorOutput).to.match(/ERROR_2.+error 2/);
  });
});
