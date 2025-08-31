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
import { inspect } from 'node:util';
import ansis from 'ansis';
import { AnyJson } from '@salesforce/ts-types';

function prettyPrint(obj: AnyJson): string {
  if (!obj) return inspect(obj);
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'number') return obj.toString();
  if (typeof obj === 'boolean') return obj.toString();
  if (typeof obj === 'object') {
    return Object.entries(obj)
      .map(([key, value]) => `${key}: ${inspect(value)}`)
      .join(', ');
  }

  return inspect(obj);
}

export default function styledObject(obj: AnyJson, keys?: string[]): string {
  if (!obj) return inspect(obj);
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'number') return obj.toString();
  if (typeof obj === 'boolean') return obj.toString();

  const output: string[] = [];
  const keyLengths = Object.keys(obj).map((key) => key.toString().length);
  const maxKeyLength = Math.max(...keyLengths) + 2;

  const logKeyValue = (key: string, value: AnyJson): string =>
    `${ansis.blue(key)}:` + ' '.repeat(maxKeyLength - key.length - 1) + prettyPrint(value);

  for (const [key, value] of Object.entries(obj)) {
    if (keys && !keys.includes(key)) continue;
    if (Array.isArray(value)) {
      if (value.length > 0) {
        output.push(logKeyValue(key, value[0]));
        for (const e of value.slice(1)) {
          output.push(' '.repeat(maxKeyLength) + prettyPrint(e));
        }
      }
    } else if (value !== null && value !== undefined) {
      output.push(logKeyValue(key, value));
    }
  }

  return output.join('\n');
}
