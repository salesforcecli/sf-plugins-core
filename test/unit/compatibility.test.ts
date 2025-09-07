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
