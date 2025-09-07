/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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

  it('should have correct output for multiple errors in table format when errorCode is MULTIPLE_API_ERRORS', () => {
    const innerError = SfError.create({
      message: 'foo',
      data: [
        { errorCode: 'ERROR_1', message: 'error 1' },
        { errorCode: 'ERROR_2', message: 'error 2' },
      ],
    });
    const sfError = SfError.create({
      name: 'myError',
      message: 'foo',
      actions: ['bar'],
      context: 'myContext',
      exitCode: 8,
      cause: innerError,
    });
    const err = SfCommandError.from(sfError, 'thecommand');
    err.code = 'MULTIPLE_API_ERRORS';
    const errorOutput = formatError(err);
    expect(errorOutput).to.match(/Error Code.+Message/);
    expect(errorOutput).to.match(/ERROR_1.+error 1/);
    expect(errorOutput).to.match(/ERROR_2.+error 2/);
  });
});
