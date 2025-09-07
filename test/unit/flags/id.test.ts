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
import { Messages } from '@salesforce/core/messages';
import { salesforceIdFlag } from '../../../src/flags/salesforceId.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
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

  it('allows 15 or 18 when both are specified', async () => {
    const out = await Parser.parse([`--id=${id15}`], {
      flags: { id: salesforceIdFlag({ length: 'both' }) },
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
      expect(error.message).to.include(messages.getMessage('errors.InvalidIdLength', ['15 or 18']));
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
      expect(error.message).to.include(messages.getMessage('errors.InvalidId'));
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
      expect(error.message).to.include(messages.getMessage('errors.InvalidIdLength', ['15']));
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
      expect(error.message).to.include(messages.getMessage('errors.InvalidIdLength', ['18']));
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
      expect(error.message).to.include(messages.getMessage('errors.InvalidPrefix', ['000']));
    }
  });
});
