/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Parser } from '@oclif/core';
import { Messages } from '@salesforce/core';
import { expect } from 'chai';
import { Duration } from '@salesforce/kit';
import { durationFlag } from '../../../src/flags/duration';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');

describe('duration flag', () => {
  describe('no default, hours', () => {
    const buildProps = {
      flags: {
        wait: durationFlag({
          unit: 'hours',
          description: 'test',
          char: 'w',
        }),
      },
    };
    it('passes', async () => {
      const out = await Parser.parse(['--wait=10'], buildProps);
      expect(out.flags.wait?.quantity).to.equal(10);
      expect(out.flags.wait?.unit).to.equal(Duration.Unit.HOURS);
    });
    it('passes with default', async () => {
      const out = await Parser.parse([], buildProps);
      expect(out.flags.wait).to.equal(undefined);
    });
  });

  describe('defaultValue zero', () => {
    const buildProps = {
      flags: {
        wait: durationFlag({
          unit: 'hours',
          description: 'test',
          defaultValue: 0,
          char: 'w',
        }),
      },
    };
    it('passes', async () => {
      const out = await Parser.parse(['--wait=10'], buildProps);
      expect(out.flags.wait?.quantity).to.equal(10);
      expect(out.flags.wait?.unit).to.equal(Duration.Unit.HOURS);
    });
    it('passes using defaultValue', async () => {
      const out = await Parser.parse([], buildProps);
      expect(out.flags.wait?.quantity).to.equal(0);
      expect(out.flags.wait?.unit).to.equal(Duration.Unit.HOURS);
    });
  });

  describe('validation with no options and weeks unit', () => {
    const defaultValue = 33;
    const buildProps = {
      flags: {
        wait: durationFlag({
          unit: 'weeks',
          defaultValue,
          description: 'test',
          char: 'w',
        }),
      },
    };
    it('passes', async () => {
      const out = await Parser.parse(['--wait=10'], buildProps);
      expect(out.flags.wait?.quantity).to.equal(10);
      expect(out.flags.wait?.unit).to.equal(Duration.Unit.WEEKS);
    });
    it('passes with default', async () => {
      const out = await Parser.parse([], buildProps);
      expect(out.flags.wait?.quantity).to.equal(33);
    });
  });

  describe('validation with all options', () => {
    const min = 1;
    const max = 60;
    const defaultValue = 33;
    const buildProps = {
      flags: {
        wait: durationFlag({
          defaultValue,
          min,
          max,
          unit: 'minutes',
          description: 'test',
          char: 'w',
        }),
      },
    };
    it('passes', async () => {
      const out = await Parser.parse(['--wait=10'], buildProps);
      expect(out.flags.wait?.quantity).to.equal(10);
    });
    it('min passes', async () => {
      const out = await Parser.parse([`--wait=${min}`], buildProps);
      expect(out.flags.wait?.quantity).to.equal(min);
    });
    it('max passes', async () => {
      const out = await Parser.parse([`--wait=${max}`], buildProps);
      expect(out.flags.wait?.quantity).to.equal(max);
    });
    it('default works', async () => {
      const out = await Parser.parse([], buildProps);
      expect(out.flags.wait?.quantity).to.equal(defaultValue);
    });
    it('default default function', async () => {
      // @ts-expect-error: type mismatch
      buildProps.flags.wait.default = async (context: { options: { defaultValue: number } }) =>
        Duration.minutes(context.options.defaultValue + 1);
      const out = await Parser.parse([], buildProps);
      expect(out.flags.wait?.quantity).to.equal(defaultValue + 1);
    });
    describe('failures', () => {
      it('below min fails', async () => {
        try {
          const out = await Parser.parse([`--wait=${min - 1}`], buildProps);

          throw new Error(`Should have thrown an error ${JSON.stringify(out)}`);
        } catch (err) {
          const error = err as Error;
          expect(error.message).to.include(messages.getMessage('errors.DurationBounds', [1, 60]));
        }
      });
      it('above max fails', async () => {
        try {
          const out = await Parser.parse([`--wait=${max + 1}`], buildProps);
          throw new Error(`Should have thrown an error ${JSON.stringify(out)}`);
        } catch (err) {
          const error = err as Error;
          expect(error.message).to.include(messages.getMessage('errors.DurationBounds', [1, 60]));
        }
      });
      it('invalid input', async () => {
        try {
          const out = await Parser.parse(['--wait=abc}'], buildProps);
          throw new Error(`Should have thrown an error ${JSON.stringify(out)}`);
        } catch (err) {
          const error = err as Error;
          expect(error.message).to.include(messages.getMessage('errors.InvalidDuration'));
        }
      });
    });
  });

  describe('validation with min not max', () => {
    const min = 1;
    const buildProps = {
      flags: {
        wait: durationFlag({
          min,
          unit: 'minutes',
          description: 'test',
          char: 'w',
        }),
      },
    };
    it('passes', async () => {
      const out = await Parser.parse(['--wait=10'], buildProps);
      expect(out.flags.wait?.quantity).to.equal(10);
    });
    it('min passes', async () => {
      const out = await Parser.parse([`--wait=${min}`], buildProps);
      expect(out.flags.wait?.quantity).to.equal(min);
    });
    describe('failures', () => {
      it('below min fails', async () => {
        try {
          const out = await Parser.parse([`--wait=${min - 1}`], buildProps);

          throw new Error(`Should have thrown an error ${JSON.stringify(out)}`);
        } catch (err) {
          const error = err as Error;
          expect(error.message).to.include(messages.getMessage('errors.DurationBoundsMin', [min]));
        }
      });
    });
  });

  describe('validation with max not min', () => {
    const max = 60;
    const buildProps = {
      flags: {
        wait: durationFlag({
          max,
          unit: 'minutes',
          description: 'test',
          char: 'w',
        }),
      },
    };
    it('passes', async () => {
      const out = await Parser.parse(['--wait=10'], buildProps);
      expect(out.flags.wait?.quantity).to.equal(10);
    });
    it('max passes', async () => {
      const out = await Parser.parse([`--wait=${max}`], buildProps);
      expect(out.flags.wait?.quantity).to.equal(max);
    });
    describe('failures', () => {
      it('above max fails', async () => {
        try {
          const out = await Parser.parse([`--wait=${max + 1}`], buildProps);
          throw new Error(`Should have thrown an error ${JSON.stringify(out)}`);
        } catch (err) {
          const error = err as Error;
          expect(error.message).to.include(messages.getMessage('errors.DurationBoundsMax', [max]));
        }
      });
    });
  });
});
