/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Progress } from '../../../src/ux';

describe('Progress', () => {
  let sandbox: sinon.SinonSandbox;
  let writeStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    writeStub = sandbox.stub(process.stderr, 'write').withArgs(sinon.match('PROGRESS')).returns(true);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('start', () => {
    it('should display a progress bar if output is enabled', () => {
      const progress = new Progress(true);
      progress.start(10);
      progress.finish();
      expect(writeStub.firstCall.args[0]).to.match(/^PROGRESS\s\|\s(.*?)\s\|\s0\/10\sComponents/);
    });

    it('should not display anything if output is not enabled', () => {
      const progress = new Progress(false);
      progress.start(10);
      progress.finish();
      expect(writeStub.callCount).to.equal(0);
    });
  });

  describe('update', () => {
    it('should update the progress bar', () => {
      const progress = new Progress(true);
      progress.start(10);
      progress.update(5);
      progress.finish();
      expect(writeStub.lastCall.args[0]).to.match(/^PROGRESS\s\|\s(.*?)\s\|\s5\/10\sComponents/);
    });
  });

  describe('stop', () => {
    it('should stop the progress bar', () => {
      const progress = new Progress(true);
      progress.start(10);
      progress.stop();
      expect(writeStub.lastCall.args[0]).to.match(/^PROGRESS\s\|\s(.*?)\s\|\s0\/10\sComponents/);
    });
  });
});
