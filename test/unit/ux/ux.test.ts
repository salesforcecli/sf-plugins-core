/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import * as sinon from 'sinon';
import { CliUx } from '@oclif/core';
import { Ux } from '../../../src/ux';

describe('Ux', () => {
  let sandbox: sinon.SinonSandbox;
  let infoStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    infoStub = sandbox.stub(CliUx.ux, 'info').callsFake(() => {});
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('table', () => {
    it('should log a table', () => {
      const ux = new Ux(true);
      ux.table([{ key: 'foo', value: 'bar' }], { key: {}, value: {} }, { printLine: CliUx.ux.info });
      expect(infoStub.args).to.deep.equal([
        ['\u001b[1m Key Value \u001b[22m'],
        ['\u001b[1m ─── ───── \u001b[22m'],
        [' foo bar   '],
      ]);
    });

    it('should not log anything if output is not enabled', () => {
      const ux = new Ux(false);
      ux.table([{ key: 'foo', value: 'bar' }], { key: {}, value: {} });
      expect(infoStub.callCount).to.equal(0);
    });
  });

  describe('url', () => {
    it('should log a url', () => {
      const ux = new Ux(true);
      ux.url('Salesforce', 'https://developer.salesforce.com/');
      expect(infoStub.firstCall.args).to.deep.equal(['https://developer.salesforce.com/']);
    });

    it('should not log anything if output is not enabled', () => {
      const ux = new Ux(false);
      ux.url('Salesforce', 'https://developer.salesforce.com/');
      expect(infoStub.callCount).to.equal(0);
    });
  });

  describe('styledJSON', () => {
    it('should log stylized json', () => {
      const ux = new Ux(true);
      ux.styledJSON({ foo: 'bar' });
      expect(infoStub.firstCall.args).to.deep.equal([
        '\x1B[97m{\x1B[39m\n  \x1B[94m"foo"\x1B[39m\x1B[93m:\x1B[39m \x1B[92m"bar"\x1B[39m\n\x1B[97m}\x1B[39m',
      ]);
    });

    it('should not log anything if output is not enabled', () => {
      const ux = new Ux(false);
      ux.styledJSON({ foo: 'bar' });
      expect(infoStub.callCount).to.equal(0);
    });
  });

  describe('styledObject', () => {
    it('should log stylized object', () => {
      const ux = new Ux(true);
      ux.styledObject({ foo: 'bar' });
      expect(infoStub.firstCall.args).to.deep.equal(['\u001b[34mfoo\u001b[39m: bar']);
    });

    it('should not log anything if output is not enabled', () => {
      const ux = new Ux(false);
      ux.styledObject({ foo: 'bar' });
      expect(infoStub.callCount).to.equal(0);
    });
  });

  describe('styledHeader', () => {
    it('should log stylized header', () => {
      const ux = new Ux(true);
      ux.styledHeader('A Stylized Header');
      expect(infoStub.firstCall.args).to.deep.equal(['\u001b[2m=== \u001b[22m\u001b[1mA Stylized Header\u001b[22m\n']);
    });

    it('should not log anything if output is not enabled', () => {
      const ux = new Ux(false);
      ux.styledHeader('A Stylized Header');
      expect(infoStub.callCount).to.equal(0);
    });
  });
});
