/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { CliUx } from '@oclif/core';
import { Spinner } from '../../../src/ux';

describe('Spinner', () => {
  let sandbox: sinon.SinonSandbox;
  let writeStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    // @ts-expect-error because _write is a protected member
    writeStub = sandbox.stub(CliUx.ux.action, '_write');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('start/stop', () => {
    it('should start a spinner if output is enabled', () => {
      const spinner = new Spinner(true);
      spinner.start('Doing things');
      spinner.stop('Finished');
      expect(writeStub.firstCall.args).to.deep.equal(['stderr', 'Doing things...']);
    });

    it('should not log anything if output is not enabled', () => {
      const spinner = new Spinner(false);
      spinner.start('Doing things');
      spinner.stop('Finished');
      expect(writeStub.callCount).to.equal(0);
    });
  });

  describe('pause', () => {
    it('should pause the spinner if output is enabled', () => {
      const spinner = new Spinner(true);
      spinner.start('Doing things');
      spinner.pause(() => {});
      spinner.stop('Finished');
      expect(writeStub.firstCall.args).to.deep.equal(['stderr', 'Doing things...']);
    });

    it('should not log anything if output is not enabled', () => {
      const spinner = new Spinner(false);
      spinner.start('Doing things');
      spinner.pause(() => {});
      spinner.stop('Finished');
      expect(writeStub.callCount).to.equal(0);
    });
  });

  describe('status', () => {
    it('should set the status of the spinner', () => {
      const spinner = new Spinner(true);
      spinner.start('Doing things');
      spinner.status = 'running';
      expect(spinner.status).to.equal('running');
      spinner.stop('Finished');
    });
  });
});
