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
import { Progress } from '../../../src/ux/progress.js';

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
