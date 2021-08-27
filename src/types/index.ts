/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Deployer } from '../deployer';

export type DataObject = {
  [key: string]: string | boolean;
};

export namespace EnvDisplay {
  export type HookMeta<T extends DataObject> = {
    options: {};
    return: T;
  };
}

export namespace EnvList {
  type Table<T extends DataObject> = {
    data: T[];
    columns: Array<keyof T>;
    title: string;
  };

  type Options = {
    all: boolean;
  };

  export type HookMeta<T extends DataObject> = {
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
