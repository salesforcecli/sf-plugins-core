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
 * Describes an object that is intended to be rendered in a table, which requires
 * that no value is an array.
 */
export type TableObject = {
  [key: string]: string | number | boolean | null | undefined;
};

export namespace EnvDisplay {
  export type HookMeta<T extends JsonObject> = {
    options: { targetEnv: string };
    return: T;
  };
}

export namespace EnvList {
  type Table<T extends TableObject> = {
    data: T[];
    columns: Array<keyof T>;
    title: string;
  };

  type Options = {
    all: boolean;
  };

  export type HookMeta<T extends TableObject> = {
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
