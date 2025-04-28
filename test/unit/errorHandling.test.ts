/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { SfError } from '@salesforce/core/sfError';
import { AnyJson } from '@salesforce/ts-types';
import { Errors } from '@oclif/core';
import { computeErrorCode, computeErrorData, errorIsGack, errorIsTypeError } from '../../src/errorHandling.js';
import { SfCommandError } from '../../src/SfCommandError.js';

describe('typeErrors', () => {
  let typeError: Error;

  before(() => {
    try {
      const n = null;
      // @ts-expect-error I know it's wrong, I need an error!
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      n.f();
    } catch (e) {
      if (e instanceof TypeError) {
        typeError = e;
      }
    }
  });
  it('matches on TypeError as error name', () => {
    expect(errorIsTypeError(typeError)).to.be.true;
  });

  it('matches on TypeError in stack', () => {
    const e = new Error('some error');
    e.stack = e.stack + typeError.name;
    expect(errorIsTypeError(e)).to.be.true;
  });

  it('matches on TypeError in stack (check against false positive)', () => {
    const e = new Error('some error');
    expect(errorIsTypeError(e)).to.be.false;
  });

  it('matches on TypeError as cause', () => {
    const error = new SfError('some error', 'testError', [], 44, typeError);
    expect(errorIsTypeError(error)).to.be.true;
  });
});
describe('gacks', () => {
  const realGackSamples = [
    '963190677-320016 (165202460)',
    '1662648879-55786 (-1856191902)',
    '694826414-169428 (2085174272)',
    '1716315817-543601 (74920438)',
    '1035887602-340708 (1781437152)',
    '671603042-121307 (-766503277)',
    '396937656-5973 (-766503277)',
    '309676439-91665 (-153174221)',
    '956661320-295482 (2000727581)',
    '1988392611-333742 (1222029414)',
    '1830254280-281143 (331700540)',
  ];

  it('says true for sample gacks', () => {
    realGackSamples.forEach((gack) => {
      expect(errorIsGack(new SfError(gack))).to.be.true;
    });
  });

  it('error in stack', () => {
    const error = new SfError('some error');
    error.stack = realGackSamples[0];
    expect(errorIsGack(error)).to.be.true;
  });

  it('error in sfError cause', () => {
    const error = new SfError('some error', 'testError', [], 44, new Error(realGackSamples[0]));
    expect(errorIsGack(error)).to.be.true;
  });
});

describe('precedence', () => {
  it('oclif beats normal exit code', () => {
    const e = new SfError('foo', 'foo', [], 44, undefined);
    // @ts-expect-error doesn't know about oclif
    e.oclif = {
      exit: 99,
    };
    expect(computeErrorCode(e)).to.equal(99);
  });
  it('oclif vs. normal exit code, but oclif has undefined', () => {
    const e = new SfError('foo', 'foo', [], 44, undefined);
    // @ts-expect-error doesn't know about oclif
    e.oclif = {};
    expect(computeErrorCode(e)).to.equal(44);
  });
  it('oclif vs. normal exit code, but oclif has 0', () => {
    const e = new SfError('foo', 'foo', [], 44, undefined);
    // @ts-expect-error doesn't know about oclif
    e.oclif = {
      exit: 0,
    };
    expect(computeErrorCode(e)).to.equal(0);
  });
  it('gack beats oclif and normal exit code', () => {
    const e = new SfError(
      'for a good time call Salesforce Support and ask for 1830254280-281143 (867530999)',
      'foo',
      [],
      44,
      undefined
    );
    // @ts-expect-error doesn't know about oclif
    e.oclif = {
      exit: 99,
    };
    expect(computeErrorCode(e)).to.equal(20);
  });
  it('type error beats oclif and normal exit code', () => {
    const e = new SfError('TypeError: stop using as any!', 'TypeError', [], 44, undefined);
    // @ts-expect-error doesn't know about oclif
    e.oclif = {
      exit: 99,
    };
    expect(computeErrorCode(e)).to.equal(10);
  });
});

describe('SfCommandError.toJson()', () => {
  it('basic', () => {
    const result = SfCommandError.from(new Error('foo'), 'the:cmd').toJson();
    expect(result).to.deep.include({
      code: '1',
      status: 1,
      exitCode: 1,
      commandName: 'the:cmd',
      context: 'the:cmd',
      message: 'foo',
      name: 'Error', // this is the default
    });
    expect(result.stack).to.be.a('string').and.include('Error: foo');
  });
  it('with warnings', () => {
    const warnings = ['your version of node is over 10 years old'];
    const result = SfCommandError.from(new Error('foo'), 'the:cmd', warnings).toJson();
    expect(result).to.deep.include({
      code: '1',
      status: 1,
      exitCode: 1,
      commandName: 'the:cmd',
      context: 'the:cmd',
      message: 'foo',
      name: 'Error', // this is the default
      warnings,
    });
    expect(result.stack).to.be.a('string').and.include('Error: foo');
  });
  describe('context', () => {
    it('sfError with context', () => {
      const sfError = SfError.create({
        name: 'myError',
        message: 'foo',
        actions: ['bar'],
        context: 'myContext',
        exitCode: 8,
      });
      const result = SfCommandError.from(sfError, 'the:cmd').toJson();
      expect(result).to.deep.include({
        code: 'myError',
        status: 8,
        exitCode: 8,
        commandName: 'the:cmd',
        context: 'myContext',
        message: 'foo',
        name: 'myError',
      });
      expect(result.stack).to.be.a('string').and.include('myError: foo');
    });
    it('sfError with undefined context', () => {
      const sfError = SfError.create({
        name: 'myError',
        message: 'foo',
        actions: ['bar'],
        context: undefined,
        exitCode: 8,
      });
      const result = SfCommandError.from(sfError, 'the:cmd').toJson();
      expect(result).to.deep.include({
        code: 'myError',
        status: 8,
        exitCode: 8,
        commandName: 'the:cmd',
        // defaults to the command name
        context: 'the:cmd',
        message: 'foo',
        name: 'myError',
      });
      expect(result.stack).to.be.a('string').and.include('myError: foo');
    });
  });
});

describe('computeErrorData', () => {
  interface ErrorWithData extends Error {
    data?: AnyJson;
  }

  it('should return data from error.data when present', () => {
    const sfError = SfError.create({
      name: 'myError',
      message: 'foo',
      actions: ['bar'],
      context: 'myContext',
      exitCode: 8,
      data: { foo: 'bar' },
    });
    expect(computeErrorData(sfError)).to.deep.equal({ foo: 'bar' });
  });

  it('should return cause.data when error.data is not present but cause.data is', () => {
    const sfError = SfError.create({
      name: 'myError',
      message: 'foo',
      actions: ['bar'],
      context: 'myContext',
      exitCode: 8,
    });
    const err: ErrorWithData = { name: 'testError', message: 'baz', data: { foo: 'baz' } };
    sfError.cause = err;
    expect(computeErrorData(sfError)).to.deep.equal({ foo: 'baz' });
  });

  it('should return undefined when no data or cause is present', () => {
    const error = new Error('test error') as ErrorWithData;
    expect(computeErrorData(error)).to.be.undefined;
  });

  it('should handle SfError with data', () => {
    const error = new SfError('test error', 'TestError', [], 1, undefined);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (error as any).data = { foo: 'bar' };
    expect(computeErrorData(error)).to.deep.equal({ foo: 'bar' });
  });

  it('should handle CLIError with data', () => {
    const err = new Errors.CLIError('Nonexistent flag: --INVALID\nSee more help with --help') as ErrorWithData;
    err.data = { foo: 'bar' };
    expect(computeErrorData(err)).to.deep.equal({ foo: 'bar' });
  });
});
