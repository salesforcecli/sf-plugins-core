/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Deployer } from '../deployer';

export type JsonObject = {
  [key: string]: string | string[] | number | number[] | boolean | boolean[] | null | undefined;
};

/**
 * By default `sf env display` will display every key/value returned by the hook.
 * It will also Title Case every key for readability. To overwrite this behavior,
 * you can specify how a key should be displayed to the user.
 *
 * @example
 * { data: { theURL: 'https://example.com' } }
 * // Renders as:
 * Key     Value
 * ------- -------------------
 * The URL https://example.com
 *
 * @example
 * {
 *   data: { theURL: 'https://example.com' }
 *   keys: { theURL: 'Url' },
 * }
 * // Renders as:
 * Key Value
 * --- -------------------
 * Url https://example.com
 */
export namespace EnvDisplay {
  type Keys<T> = Record<keyof T, string>;

  export type HookMeta<T extends JsonObject> = {
    options: { targetEnv: string };
    return: { data: T; keys?: Keys<T> };
  };
}

/**
 * By default `sf env list` will render a table with all the data provided by the hook.
 * The columns of the table are derived from the keys of the provided data. These column
 * headers are Title Cased for readability. To overwrite a column name specifiy it the `keys`
 * property.
 *
 * @example
 * {
 *   title: 'My Envs',
 *   data: { username: 'foo', theURL: 'https://example.com' }
 * }
 * // Renders as:
 * My Envs
 * ================================
 * | Username | The URL
 * | foo      | https://example.com
 *
 * @example
 * {
 *   data: { username: 'foo', theURL: 'https://example.com' }
 *   keys: { theURL: 'Url', username: 'Name' },
 * }
 *
 * // Renders as:
 * My Envs
 * ============================
 * | Name | Url
 * | foo  | https://example.com
 */
export namespace EnvList {
  type Table<T extends JsonObject> = {
    data: T[];
    keys?: Record<keyof T, string>;
    title: string;
  };

  type Options = {
    all: boolean;
  };

  export type HookMeta<T extends JsonObject> = {
    options: Options;
    return: Array<Table<T>>;
  };
}

export namespace Deploy {
  export type HookMeta<T extends Deployer> = {
    options: {};
    return: T[];
  };
}

export namespace Login {
  export type HookMeta = {
    options: {};
    return: void;
  };
}
