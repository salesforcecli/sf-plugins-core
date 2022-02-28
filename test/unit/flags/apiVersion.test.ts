/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { CliUx, Parser } from '@oclif/core';
import { Messages } from '@salesforce/core';
import * as sinon from 'sinon';
import { apiVersionFlag, minValidApiVersion, maxDeprecated, maxDeprecatedUrl } from '../../../src/flags/apiVersion';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');

describe('fs flags', () => {
  const sandbox = sinon.createSandbox();
  let uxStub: sinon.SinonStub;

  beforeEach(() => {
    uxStub = sandbox.stub(CliUx.ux, 'warn');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('passes with a valid apiVersion', async () => {
    const versionToTest = `${maxDeprecated + 10}.0`;
    const out = await Parser.parse([`--api-version=${versionToTest}`], {
      flags: { 'api-version': apiVersionFlag() },
    });
    expect(out.flags).to.deep.include({ 'api-version': versionToTest });
    // no deprecation warning
    expect(uxStub.callCount).to.equal(0);
  });

  it('passes with minimum valid apiVersion', async () => {
    const versionToTest = `${maxDeprecated + 1}.0`;
    const out = await Parser.parse([`--api-version=${versionToTest}`], {
      flags: { 'api-version': apiVersionFlag() },
    });
    expect(out.flags).to.deep.include({ 'api-version': versionToTest });
    // no deprecation warning
    expect(uxStub.callCount).to.equal(0);
  });

  it('throws on invalid version', async () => {
    try {
      const out = await Parser.parse(['--api-version=foo'], {
        flags: { 'api-version': apiVersionFlag() },
      });
      throw new Error(`Should have thrown an error ${JSON.stringify(out)}`);
    } catch (err) {
      const error = err as Error;
      expect(error.message).to.equal(messages.getMessage('flags.apiVersion.errors.InvalidApiVersion', ['foo']));
    }
  });

  it('throws on retired version', async () => {
    const versionToTest = `${minValidApiVersion - 1}.0`;

    try {
      const out = await Parser.parse([`--api-version=${versionToTest}`], {
        flags: { 'api-version': apiVersionFlag() },
      });
      throw new Error(`Should have thrown an error ${JSON.stringify(out)}`);
    } catch (err) {
      const error = err as Error;
      expect(error.message).to.equal(
        messages.getMessage('flags.apiVersion.errors.RetiredApiVersion', [minValidApiVersion])
      );
    }
  });

  it('warns on highest deprecated version', async () => {
    const versionToTest = `${maxDeprecated}.0`;
    const out = await Parser.parse([`--api-version=${versionToTest}`], {
      flags: { 'api-version': apiVersionFlag() },
    });
    expect(out.flags).to.deep.include({ 'api-version': versionToTest });
    expect(uxStub.callCount).to.equal(1);
    expect(uxStub.firstCall.args[0]).to.include(maxDeprecatedUrl);
  });

  it('warns on lowest deprecated version', async () => {
    const versionToTest = `${minValidApiVersion}.0`;
    const out = await Parser.parse([`--api-version=${versionToTest}`], {
      flags: { 'api-version': apiVersionFlag() },
    });
    expect(out.flags).to.deep.include({ 'api-version': versionToTest });
    expect(uxStub.callCount).to.equal(1);
    expect(uxStub.firstCall.args[0]).to.include(maxDeprecatedUrl);
  });
});
