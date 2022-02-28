/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import { expect } from 'chai';
import { Parser } from '@oclif/core';
import { Messages } from '@salesforce/core';
import * as sinon from 'sinon';
import { existingDirectory, existingFile } from '../../../src/flags/fsFlags';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');

describe('fs flags', () => {
  const sandbox = sinon.createSandbox();
  let existsStub: sinon.SinonStub;
  let statStub: sinon.SinonStub;

  beforeEach(() => {
    existsStub = sandbox.stub(fs, 'existsSync');
    statStub = sandbox.stub(fs.promises, 'stat');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('directory', () => {
    const testDir = 'some/dir';
    it('passes when dir exists', async () => {
      existsStub.returns(true);
      statStub.returns({ isDirectory: () => true });
      const out = await Parser.parse([`--dir=${testDir}`], {
        flags: { dir: existingDirectory() },
      });
      expect(out.flags).to.deep.include({ dir: testDir });
    });
    it("fails when dir doesn't exist", async () => {
      existsStub.returns(false);
      try {
        const out = await Parser.parse([`--dir=${testDir}`], {
          flags: { dir: existingDirectory() },
        });
        throw new Error(`Should have thrown an error ${JSON.stringify(out)}`);
      } catch (err) {
        const error = err as Error;
        expect(error.message).to.equal(
          messages.getMessage('flags.existingDirectory.errors.MissingDirectory', [testDir])
        );
      }
    });
    it('fails when dir exists but is not a dir', async () => {
      existsStub.returns(true);
      statStub.returns({ isDirectory: () => false });
      try {
        const out = await Parser.parse([`--dir=${testDir}`], {
          flags: { dir: existingDirectory() },
        });
        throw new Error(`Should have thrown an error ${JSON.stringify(out)}`);
      } catch (err) {
        const error = err as Error;
        expect(error.message).to.equal(
          messages.getMessage('flags.existingDirectory.errors.MissingDirectory', [testDir])
        );
      }
    });
  });

  describe('file', () => {
    const testFile = 'some/file.ext';
    it('passes when file exists', async () => {
      existsStub.returns(true);
      statStub.returns({ isFile: () => true });
      const out = await Parser.parse([`--file=${testFile}`], {
        flags: { file: existingFile() },
      });
      expect(out.flags).to.deep.include({ file: testFile });
    });
    it("fails when dir doesn't exist", async () => {
      existsStub.returns(false);
      try {
        const out = await Parser.parse([`--file=${testFile}`], {
          flags: { file: existingFile() },
        });
        throw new Error(`Should have thrown an error ${JSON.stringify(out)}`);
      } catch (err) {
        const error = err as Error;
        expect(error.message).to.equal(messages.getMessage('flags.existingFile.errors.MissingFile', [testFile]));
      }
    });
    it('fails when file exists but is not a file', async () => {
      existsStub.returns(true);
      statStub.returns({ isFile: () => false });
      try {
        const out = await Parser.parse([`--file=${testFile}`], {
          flags: { file: existingFile() },
        });
        throw new Error(`Should have thrown an error ${JSON.stringify(out)}`);
      } catch (err) {
        const error = err as Error;
        expect(error.message).to.equal(messages.getMessage('flags.existingFile.errors.NotAFile', [testFile]));
      }
    });
  });
});
