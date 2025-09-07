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
import { Parser } from '@oclif/core';
import { Lifecycle, Messages } from '@salesforce/core';
import sinon from 'sinon';
import {
  orgApiVersionFlag,
  minValidApiVersion,
  maxDeprecated,
  maxDeprecatedUrl,
} from '../../../src/flags/orgApiVersion.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');

describe('fs flags', () => {
  const sandbox = sinon.createSandbox();
  let warnStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox.stub(Lifecycle, 'getInstance').returns(Lifecycle.prototype);
    warnStub = sandbox.stub(Lifecycle.prototype, 'emitWarning');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('passes with a valid apiVersion', async () => {
    const versionToTest = `${maxDeprecated + 10}.0`;
    const out = await Parser.parse([`--api-version=${versionToTest}`], {
      flags: { 'api-version': orgApiVersionFlag() },
    });
    expect(out.flags).to.deep.include({ 'api-version': versionToTest });
    // no deprecation warning
    expect(warnStub.callCount).to.equal(0);
  });

  it('passes with minimum valid apiVersion', async () => {
    const versionToTest = `${maxDeprecated + 1}.0`;
    const out = await Parser.parse([`--api-version=${versionToTest}`], {
      flags: { 'api-version': orgApiVersionFlag() },
    });
    expect(out.flags).to.deep.include({ 'api-version': versionToTest });
    // no deprecation warning
    expect(warnStub.callCount).to.equal(0);
  });

  it('throws on invalid version', async () => {
    try {
      const out = await Parser.parse(['--api-version=foo'], {
        flags: { 'api-version': orgApiVersionFlag() },
      });
      throw new Error(`Should have thrown an error ${JSON.stringify(out)}`);
    } catch (err) {
      const error = err as Error;
      expect(error.message).to.include(messages.getMessage('errors.InvalidApiVersion', ['foo']));
    }
  });

  it('throws on retired version', async () => {
    const versionToTest = `${minValidApiVersion - 1}.0`;

    try {
      const out = await Parser.parse([`--api-version=${versionToTest}`], {
        flags: { 'api-version': orgApiVersionFlag() },
      });
      throw new Error(`Should have thrown an error ${JSON.stringify(out)}`);
    } catch (err) {
      const error = err as Error;
      expect(error.message).to.include(messages.getMessage('errors.RetiredApiVersion', [minValidApiVersion]));
    }
  });

  it('warns on highest deprecated version', async () => {
    const versionToTest = `${maxDeprecated}.0`;
    const out = await Parser.parse([`--api-version=${versionToTest}`], {
      flags: { 'api-version': orgApiVersionFlag() },
    });
    expect(out.flags).to.deep.include({ 'api-version': versionToTest });
    expect(warnStub.callCount).to.equal(1);
    expect(warnStub.firstCall.args[0]).to.include(maxDeprecatedUrl);
  });

  it('warns on lowest deprecated version', async () => {
    const versionToTest = `${minValidApiVersion}.0`;
    const out = await Parser.parse([`--api-version=${versionToTest}`], {
      flags: { 'api-version': orgApiVersionFlag() },
    });
    expect(out.flags).to.deep.include({ 'api-version': versionToTest });
    expect(warnStub.callCount).to.equal(1);
    expect(warnStub.firstCall.args[0]).to.include(maxDeprecatedUrl);
  });
});
