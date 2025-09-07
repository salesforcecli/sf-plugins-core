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
import { Flags } from '@oclif/core';
import { Messages } from '@salesforce/core/messages';
import { Duration } from '@salesforce/kit';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');

type DurationUnit = Lowercase<keyof typeof Duration.Unit>;

export type DurationFlagConfig = {
  unit: Required<DurationUnit>;
  defaultValue?: number;
  min?: number;
  max?: number;
};

/**
 * Duration flag with built-in default and min/max validation
 * You must specify a unit
 * Defaults to undefined if you don't specify a default
 *
 * @example
 *
 * ```
 * import { Flags } from '@salesforce/sf-plugins-core';
 * public static flags = {
 *    wait: Flags.duration({
 *       min: 1,
 *       unit: 'minutes'
 *       defaultValue: 33,
 *       char: 'w',
 *       description: 'Wait time in minutes'
 *    }),
 * }
 * ```
 */
export const durationFlag = Flags.custom<Duration, DurationFlagConfig>({
  // eslint-disable-next-line @typescript-eslint/require-await
  parse: async (input, _, opts) => validate(input, opts),
  // eslint-disable-next-line @typescript-eslint/require-await
  default: async (context) =>
    typeof context.options.defaultValue === 'number'
      ? toDuration(context.options.defaultValue, context.options.unit)
      : undefined,
  // eslint-disable-next-line @typescript-eslint/require-await
  defaultHelp: async (context) =>
    typeof context.options.defaultValue === 'number'
      ? toDuration(context.options.defaultValue, context.options.unit).toString()
      : undefined,
});

const validate = (input: string, config: DurationFlagConfig): Duration => {
  const { min, max, unit } = config || {};
  let parsedInput: number;

  try {
    parsedInput = parseInt(input, 10);
    if (typeof parsedInput !== 'number' || isNaN(parsedInput)) {
      throw messages.createError('errors.InvalidDuration');
    }
  } catch (e) {
    throw messages.createError('errors.InvalidDuration');
  }

  if (min && max && (parsedInput < min || parsedInput > max)) {
    throw messages.createError('errors.DurationBounds', [min, max]);
  } else if (min && parsedInput < min) {
    throw messages.createError('errors.DurationBoundsMin', [min]);
  } else if (max && parsedInput > max) {
    throw messages.createError('errors.DurationBoundsMax', [max]);
  }

  return toDuration(parsedInput, unit);
};

const toDuration = (parsedInput: number, unit: DurationUnit): Duration => Duration[unit](parsedInput);
