/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import {
  EnvironmentVariable,
  SUPPORTED_ENV_VARS,
  ORG_CONFIG_ALLOWED_PROPERTIES,
  OrgConfigProperties,
  SfdxPropertyKeys,
  SFDX_ALLOWED_PROPERTIES,
  Messages,
} from '@salesforce/core';
import { parseVarArgs, toHelpSection } from '../../src/util.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');

describe('toHelpSection', () => {
  it('should produce help section for env vars', () => {
    const envVarSection = toHelpSection('ENV VAR SECTION', EnvironmentVariable.SFDX_ACCESS_TOKEN);
    expect(envVarSection).to.have.property('header', 'ENV VAR SECTION');
    expect(envVarSection).to.have.property('body').to.have.property('length', 1);
    expect(envVarSection?.body?.[0]).to.deep.equal({
      name: 'SFDX_ACCESS_TOKEN',
      description: SUPPORTED_ENV_VARS[EnvironmentVariable.SFDX_ACCESS_TOKEN].description,
    });
  });

  it('should produce help section for org config vars', () => {
    const orgConfigSection = toHelpSection('ORG CONFIG VAR SECTION', OrgConfigProperties.TARGET_ORG);
    expect(orgConfigSection).to.have.property('header', 'ORG CONFIG VAR SECTION');
    expect(orgConfigSection).to.have.property('body').to.have.property('length', 1);
    const orgConfig = ORG_CONFIG_ALLOWED_PROPERTIES.find(({ key }) => key === OrgConfigProperties.TARGET_ORG);
    expect(orgConfigSection?.body?.[0]).to.deep.equal({
      name: 'target-org',
      description: orgConfig?.description,
    });
  });

  it('should produce help section for sfdx config vars', () => {
    const sfdxConfigSection = toHelpSection('SFDX CONFIG VAR SECTION', SfdxPropertyKeys.INSTANCE_URL);
    expect(sfdxConfigSection).to.have.property('header', 'SFDX CONFIG VAR SECTION');
    expect(sfdxConfigSection).to.have.property('body').to.have.property('length', 1);
    const sfdxConfig = SFDX_ALLOWED_PROPERTIES.find(({ key }) => key === SfdxPropertyKeys.INSTANCE_URL);
    expect(sfdxConfigSection?.body?.[0]).to.deep.equal({
      name: 'instanceUrl',
      description: sfdxConfig?.description,
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
    expect(mixedSection?.body).to.deep.equal([
      {
        name: 'SFDX_ACCESS_TOKEN',
        description: SUPPORTED_ENV_VARS[EnvironmentVariable.SFDX_ACCESS_TOKEN].description,
      },
      {
        name: 'target-org',
        description: orgConfig?.description,
      },
      {
        name: 'instanceUrl',
        description: sfdxConfig?.description,
      },
    ]);
  });

  it('should produce help section for arbitrary data', () => {
    const envVarSection = toHelpSection('ARBITRARY SECTION', { 'foo bar': 'hello world' });
    expect(envVarSection).to.have.property('header', 'ARBITRARY SECTION');
    expect(envVarSection).to.have.property('body').to.have.property('length', 1);
    expect(envVarSection?.body?.[0]).to.deep.equal({
      name: 'foo bar',
      description: 'hello world',
    });
  });
});

describe('parseVarArgs', () => {
  it('should parse varargs', () => {
    const varargs = parseVarArgs({}, ['key1=value1']);
    expect(varargs).to.deep.equal({ key1: 'value1' });
  });

  it('should parse multiple varargs', () => {
    const varargs = parseVarArgs({}, ['key1=value1', 'key2=value2']);
    expect(varargs).to.deep.equal({ key1: 'value1', key2: 'value2' });
  });

  it('should allow an empty value', () => {
    const varargs = parseVarArgs({}, ['key1=']);
    expect(varargs).to.deep.equal({ key1: undefined });
  });

  it('should parse varargs and not arguments', () => {
    const varargs = parseVarArgs({ arg1: 'foobar' }, ['foobar', 'key1=value1']);
    expect(varargs).to.deep.equal({ key1: 'value1' });
  });

  it('should parse single set of varargs', () => {
    const varargs = parseVarArgs({ arg1: 'foobar' }, ['foobar', 'key1', 'value1']);
    expect(varargs).to.deep.equal({ key1: 'value1' });
  });

  it('should throw if invalid format', () => {
    const badArg = 'key2:value2';
    const expectedError = messages.createError('error.InvalidArgumentFormat', [badArg]).message;
    expect(() => parseVarArgs({ arg1: 'foobar' }, ['foobar', 'key1=value1', badArg])).to.throw(expectedError);
  });

  it('should throw if duplicates exist', () => {
    expect(() => parseVarArgs({ arg1: 'foobar' }, ['foobar', 'key1=value1', 'key1=value1'])).to.throw(
      'Found duplicate argument key1.'
    );
  });
});
