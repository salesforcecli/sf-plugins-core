/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { Parser } from '@oclif/core';
import { Messages } from '@salesforce/core';
import { salesforceIdFlag } from '../../../src/flags/salesforceId';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');

describe('id flag', () => {
  const id15 = '123456789012345';
  const id18 = '123456789012345678';
  const id16 = '1234567890123456';

  it('allows 15 or 18 when no length specified', async () => {
    const out = await Parser.parse([`--id=${id15}`], {
      flags: { id: salesforceIdFlag() },
    });
    expect(out.flags).to.deep.include({ id: id15 });
  });

  it('throws on invalid length id', async () => {
    try {
      const out = await Parser.parse([`--id=${id16}`], {
        flags: { id: salesforceIdFlag() },
      });
      throw new Error(`Should have thrown an error ${JSON.stringify(out)}`);
    } catch (err) {
      const error = err as Error;
      expect(error.message).to.equal(messages.getMessage('errors.InvalidIdLength', ['15 or 18']));
    }
  });

  it('throws on invalid characters in id', async () => {
    try {
      const out = await Parser.parse(['--id=???????????????'], {
        flags: { id: salesforceIdFlag() },
      });
      throw new Error(`Should have thrown an error ${JSON.stringify(out)}`);
    } catch (err) {
      const error = err as Error;
      expect(error.message).to.equal(messages.getMessage('errors.InvalidId'));
    }
  });
  it('good 15', async () => {
    const out = await Parser.parse([`--id=${id15}`], {
      flags: { id: salesforceIdFlag({ length: 15 }) },
    });
    expect(out.flags).to.deep.include({ id: id15 });
  });
  it('bad 15', async () => {
    try {
      const out = await Parser.parse([`--id=${id18}`], {
        flags: { id: salesforceIdFlag({ length: 15 }) },
      });
      throw new Error(`Should have thrown an error ${JSON.stringify(out)}`);
    } catch (err) {
      const error = err as Error;
      expect(error.message).to.equal(messages.getMessage('errors.InvalidIdLength', ['15']));
    }
  });
  it('good 18', async () => {
    const out = await Parser.parse([`--id=${id18}`], {
      flags: { id: salesforceIdFlag({ length: 18 }) },
    });
    expect(out.flags).to.deep.include({ id: id18 });
  });
  it('bad 18', async () => {
    try {
      const out = await Parser.parse([`--id=${id15}`], {
        flags: { id: salesforceIdFlag({ length: 18 }) },
      });
      throw new Error(`Should have thrown an error ${JSON.stringify(out)}`);
    } catch (err) {
      const error = err as Error;
      expect(error.message).to.equal(messages.getMessage('errors.InvalidIdLength', ['18']));
    }
  });
  it('good startsWith', async () => {
    const out = await Parser.parse([`--id=${id18}`], {
      flags: { id: salesforceIdFlag({ startsWith: '123' }) },
    });
    expect(out.flags).to.deep.include({ id: id18 });
  });
  it('bad startsWith', async () => {
    try {
      const out = await Parser.parse([`--id=${id15}`], {
        flags: { id: salesforceIdFlag({ startsWith: '000' }) },
      });
      throw new Error(`Should have thrown an error ${JSON.stringify(out)}`);
    } catch (err) {
      const error = err as Error;
      expect(error.message).to.equal(messages.getMessage('errors.InvalidPrefix', ['000']));
    }
  });
});
