/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { Command, Interfaces } from '@oclif/core';
import { arrayWithDeprecation } from '../../src/compatibility.js';

describe('arrayWithDeprecation', () => {
  class TestCommand extends Command {
    public static flags = {
      things: arrayWithDeprecation({
        char: 'a',
        description: 'api version for the org',
      }),
    };

    public async run(): Promise<Interfaces.InferredFlags<typeof TestCommand.flags>> {
      const { flags } = await this.parse(TestCommand);
      return flags;
    }
  }

  it('should split the flags on comma', async () => {
    const result = await TestCommand.run(['--things', 'a,b,c']);
    expect(result.things).to.deep.equal(['a', 'b', 'c']);
  });

  it('should split the flags on comma and ignore spaces', async () => {
    const result = await TestCommand.run(['--things', 'a, b, c']);
    expect(result.things).to.deep.equal(['a', 'b', 'c']);
  });

  it('should not split on escaped commas', async () => {
    const result = await TestCommand.run(['--things', 'a\\,b,c']);
    expect(result.things).to.deep.equal(['a,b', 'c']);
  });

  it('should allow multiple flag inputs', async () => {
    const result = await TestCommand.run(['--things', 'a', '--things', 'b', '--things', 'c']);
    expect(result.things).to.deep.equal(['a', 'b', 'c']);
  });
});
