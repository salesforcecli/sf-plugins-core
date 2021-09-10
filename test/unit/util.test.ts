/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { Separator } from 'inquirer';
import stripAnsi = require('strip-ansi');
import { EnvironmentVariable, SUPPORTED_ENV_VARS } from '@salesforce/core';
import { ORG_CONFIG_ALLOWED_PROPERTIES, OrgConfigProperties } from '@salesforce/core';
import { SfdxPropertyKeys, SFDX_ALLOWED_PROPERTIES } from '@salesforce/core';
import { generateTableChoices, toHelpSection } from '../../src/util';

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

describe('toHelpSection', () => {
  it('should produce help section for env vars', () => {
    const envVarSection = toHelpSection('ENV VAR SECTION', EnvironmentVariable.SFDX_ACCESS_TOKEN);
    expect(envVarSection).to.have.property('header', 'ENV VAR SECTION');
    expect(envVarSection).to.have.property('body').to.have.property('length', 1);
    expect(envVarSection.body[0]).to.deep.equal({
      name: 'SFDX_ACCESS_TOKEN',
      description: SUPPORTED_ENV_VARS[EnvironmentVariable.SFDX_ACCESS_TOKEN].description,
    });
  });
  it('should produce help section for org config vars', () => {
    const orgConfigSection = toHelpSection('ORG CONFIG VAR SECTION', OrgConfigProperties.TARGET_ORG);
    expect(orgConfigSection).to.have.property('header', 'ORG CONFIG VAR SECTION');
    expect(orgConfigSection).to.have.property('body').to.have.property('length', 1);
    const orgConfig = ORG_CONFIG_ALLOWED_PROPERTIES.find(({ key }) => key === OrgConfigProperties.TARGET_ORG);
    expect(orgConfigSection.body[0]).to.deep.equal({
      name: 'target-org',
      description: orgConfig.description,
    });
  });
  it('should produce help section for sfdx config vars', () => {
    const sfdxConfigSection = toHelpSection('SFDX CONFIG VAR SECTION', SfdxPropertyKeys.INSTANCE_URL);
    expect(sfdxConfigSection).to.have.property('header', 'SFDX CONFIG VAR SECTION');
    expect(sfdxConfigSection).to.have.property('body').to.have.property('length', 1);
    const sfdxConfig = SFDX_ALLOWED_PROPERTIES.find(({ key }) => key === SfdxPropertyKeys.INSTANCE_URL);
    expect(sfdxConfigSection.body[0]).to.deep.equal({
      name: 'instanceUrl',
      description: sfdxConfig.description,
    });
  });
  it('should produce help section for mixed config vars', () => {
    const mixedSection = toHelpSection(
      'MIXED VAR SECTION',
      EnvironmentVariable.SFDX_ACCESS_TOKEN,
      OrgConfigProperties.TARGET_ORG,
      SfdxPropertyKeys.INSTANCE_URL
    );
    expect(mixedSection).to.have.property('header', 'MIXED VAR SECTION');
    expect(mixedSection).to.have.property('body').to.have.property('length', 3);
    const sfdxConfig = SFDX_ALLOWED_PROPERTIES.find(({ key }) => key === SfdxPropertyKeys.INSTANCE_URL);
    const orgConfig = ORG_CONFIG_ALLOWED_PROPERTIES.find(({ key }) => key === OrgConfigProperties.TARGET_ORG);
    expect(mixedSection.body).to.deep.equal([
      {
        name: 'SFDX_ACCESS_TOKEN',
        description: SUPPORTED_ENV_VARS[EnvironmentVariable.SFDX_ACCESS_TOKEN].description,
      },
      {
        name: 'target-org',
        description: orgConfig.description,
      },
      {
        name: 'instanceUrl',
        description: sfdxConfig.description,
      },
    ]);
  });
});
