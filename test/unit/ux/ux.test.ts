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
import sinon from 'sinon';
import { ux as coreUx } from '@oclif/core';
import { captureOutput } from '@oclif/test';
import { Ux } from '../../../src/ux/ux.js';
import { convertToNewTableAPI } from '../../../src/ux/table.js';

describe('Ux', () => {
  let sandbox: sinon.SinonSandbox;
  let stdoutStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    stdoutStub = sandbox.stub(coreUx, 'stdout').callsFake(() => {});
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('table', () => {
    it('should log a table', async () => {
      const { stdout } = await captureOutput(async () => {
        const ux = new Ux();
        ux.table({ data: [{ key: 'foo', value: 'bar' }], title: 'Title' });
      });
      expect(stdout).to.include('Title');
      expect(stdout).to.match(/Key.+Value/);
      expect(stdout).to.match(/foo.+bar/);
    });

    it('should not log anything if output is not enabled', async () => {
      const { stdout } = await captureOutput(async () => {
        const ux = new Ux({ jsonEnabled: true });
        ux.table({ data: [{ key: 'foo', value: 'bar' }], title: 'Title' });
      });
      expect(stdout).to.equal('');
    });
  });

  describe('table (with convertToNewTableAPI)', () => {
    it('should log a table', async () => {
      const { stdout } = await captureOutput(async () => {
        const ux = new Ux();
        const opts = convertToNewTableAPI([{ key: 'foo', value: 'bar' }], { key: {}, value: {} }, { title: 'Title' });
        ux.table(opts);
      });
      expect(stdout).to.include('Title');
      expect(stdout).to.match(/Key.+Value/);
      expect(stdout).to.match(/foo.+bar/);
    });

    it('should not log anything if output is not enabled', async () => {
      const { stdout } = await captureOutput(async () => {
        const ux = new Ux({ jsonEnabled: true });
        ux.table(convertToNewTableAPI([{ key: 'foo', value: 'bar' }], { key: {}, value: {} }));
      });
      expect(stdout).to.equal('');
    });
  });

  describe('url', () => {
    it('should log a url', () => {
      const ux = new Ux();
      ux.url('Salesforce', 'https://developer.salesforce.com/');
      expect(stdoutStub.firstCall.args).to.deep.equal(['https://developer.salesforce.com/']);
    });

    it('should not log anything if output is not enabled', () => {
      const ux = new Ux({ jsonEnabled: true });
      ux.url('Salesforce', 'https://developer.salesforce.com/');
      expect(stdoutStub.callCount).to.equal(0);
    });
  });

  describe('styledJSON', () => {
    it('should log stylized json', () => {
      const ux = new Ux();
      ux.styledJSON({ foo: 'bar' });
      expect(stdoutStub.firstCall.args).to.deep.equal(['{\n  \u001b[94m"foo"\u001b[39m: \u001b[92m"bar"\u001b[39m\n}']);
    });

    it('should not log anything if output is not enabled', () => {
      const ux = new Ux({ jsonEnabled: true });
      ux.styledJSON({ foo: 'bar' });
      expect(stdoutStub.callCount).to.equal(0);
    });
  });

  describe('styledObject', () => {
    it('should log stylized object', () => {
      const ux = new Ux();
      ux.styledObject({ foo: 'bar' });
      expect(stdoutStub.firstCall.args).to.deep.equal(['\u001b[34mfoo\u001b[39m: bar']);
    });

    it('should not log anything if output is not enabled', () => {
      const ux = new Ux({ jsonEnabled: true });
      ux.styledObject({ foo: 'bar' });
      expect(stdoutStub.callCount).to.equal(0);
    });
  });

  describe('styledHeader', () => {
    it('should log stylized header', () => {
      const ux = new Ux();
      ux.styledHeader('A Stylized Header');
      expect(stdoutStub.firstCall.args).to.deep.equal([
        '\u001b[2m=== \u001b[22m\u001b[1mA Stylized Header\u001b[22m\n',
      ]);
    });

    it('should not log anything if output is not enabled', () => {
      const ux = new Ux({ jsonEnabled: true });
      ux.styledHeader('A Stylized Header');
      expect(stdoutStub.callCount).to.equal(0);
    });
  });
});
