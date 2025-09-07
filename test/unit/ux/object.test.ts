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
