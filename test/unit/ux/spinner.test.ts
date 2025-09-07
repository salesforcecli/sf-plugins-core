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
import { ux } from '@oclif/core';
import { Spinner } from '../../../src/ux/spinner.js';

describe('Spinner', () => {
  let sandbox: sinon.SinonSandbox;
  let writeStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    // @ts-expect-error because _write is a protected member
    writeStub = sandbox.stub(ux.action, '_write');
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
