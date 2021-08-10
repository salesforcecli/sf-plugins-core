/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { Separator } from 'inquirer';
import stripAnsi = require('strip-ansi');
import { generateTableChoices } from '../../src/util';

describe('generateTableChoices', () => {
  const columns = {
    name: 'APP OR PACKAGE',
    type: 'TYPE',
    path: 'PATH',
  };
  const choices = [
    {
      name: 'force-app',
      type: 'org',
      path: 'force-app',
      value: 'force-app',
    },
    {
      name: 'my-app',
      type: 'a-long-org',
      path: 'my-app',
      value: 'my-app',
    },
  ];
  it('should generate a formatted table of choices', () => {
    const tableChoices = generateTableChoices(columns, choices);
    expect(tableChoices[0]).to.be.instanceof(Separator);
    const separator = tableChoices[0] as typeof Separator;
    expect(stripAnsi(separator.toString())).to.be.equal('  APP OR PACKAGE TYPE       PATH      ');
    expect(tableChoices[1]).to.have.property('name').and.equal('force-app      org        force-app ');
    expect(tableChoices[2]).to.have.property('name').and.equal('my-app         a-long-org my-app    ');
  });

  it('should generate a formatted table of choices without checkbox padding', () => {
    const tableChoices = generateTableChoices(columns, choices, false);
    expect(tableChoices[0]).to.be.instanceof(Separator);
    const separator = tableChoices[0] as typeof Separator;
    expect(stripAnsi(separator.toString())).to.be.equal('APP OR PACKAGE TYPE       PATH      ');
    expect(tableChoices[1]).to.have.property('name').and.equal('force-app      org        force-app ');
    expect(tableChoices[2]).to.have.property('name').and.equal('my-app         a-long-org my-app    ');
  });
});
