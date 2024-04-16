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
  it('should show a table', () => {
    const result = styledObject([
      { foo: 1, bar: 1 },
      { foo: 2, bar: 2 },
      { foo: 3, bar: 3 },
    ]);
    expect(stripAnsi(result)).to.equal(`0: foo: 1, bar: 1
1: foo: 2, bar: 2
2: foo: 3, bar: 3`);
  });
});
