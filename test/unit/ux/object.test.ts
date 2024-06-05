/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import stripAnsi from 'strip-ansi';
import styledObject from '../../../src/ux/styledObject.js';

describe('styledObject', () => {
  it('should handle simple object', () => {
    const result = styledObject({ foo: 1, bar: 2 });
    expect(stripAnsi(result)).to.equal('foo: 1\nbar: 2');
  });

  it('should handle object with select keys', () => {
    const result = styledObject({ foo: 1, bar: 2 }, ['foo']);
    expect(stripAnsi(result)).to.equal('foo: 1');
  });

  it('should handle deeply nested object', () => {
    const result = styledObject({ foo: { bar: { baz: 1 } } });
    expect(stripAnsi(result)).to.equal('foo: bar: { baz: 1 }');
  });

  it('should handle deeply nested objects with arrays', () => {
    const result = styledObject({ foo: { bar: [{ baz: 1 }, { baz: 2 }] } });
    expect(stripAnsi(result)).to.equal('foo: bar: [ { baz: 1 }, { baz: 2 } ]');
  });

  it('should show array input as table', () => {
    const result = styledObject([
      { foo: 1, bar: 1 },
      { foo: 2, bar: 2 },
      { foo: 3, bar: 3 },
    ]);
    expect(stripAnsi(result)).to.equal(`0: foo: 1, bar: 1
1: foo: 2, bar: 2
2: foo: 3, bar: 3`);
  });

  it('should handle nulls', () => {
    const result = styledObject([{ foo: 1, bar: 1 }, null, { foo: 3, bar: 3 }]);
    expect(stripAnsi(result)).to.equal(`0: foo: 1, bar: 1
2: foo: 3, bar: 3`);
  });

  it('should handle null input', () => {
    const result = styledObject(null);
    expect(stripAnsi(result)).to.equal('null');
  });

  it('should handle string input', () => {
    const result = styledObject('foo');
    expect(stripAnsi(result)).to.equal('foo');
  });

  it('should handle number input', () => {
    const result = styledObject(1);
    expect(stripAnsi(result)).to.equal('1');
  });

  it('should handle boolean input', () => {
    const result = styledObject(true);
    expect(stripAnsi(result)).to.equal('true');
  });
});
