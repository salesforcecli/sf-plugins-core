/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Config } from '@oclif/core/lib/interfaces/config';
import { Hook, Hooks } from '@oclif/core/lib/interfaces/hooks';
import { cli } from 'cli-ux';
import { Duration, env } from '@salesforce/kit';
import { Deployer } from './deployer';
import { EnvList, EnvDisplay, JsonObject, Deploy, Login } from './types';

interface SfHooks<T = unknown> extends Hooks {
  'sf:env:list': EnvList.HookMeta<T & JsonObject>;
  'sf:env:display': EnvDisplay.HookMeta<T & JsonObject>;
  'sf:deploy': Deploy.HookMeta<T & Deployer>;
  'sf:login': Login.HookMeta;
}

type GenericHook<T extends keyof SfHooks, P> = Hook<T, SfHooks<P>>;

export class SfHook {
  public static async run<T extends keyof SfHooks>(
    config: Config,
    hookName: T,
    options: SfHooks[T]['options'] = {}
  ): Promise<Hook.Result<SfHooks[T]['return']>> {
    const timeout = Duration.milliseconds(env.getNumber('SF_HOOK_TIMEOUT_MS') || 5000);
    const results = await config.runHook<T>(hookName, options, timeout.milliseconds);
    results.failures.forEach((failure) => {
      cli.debug(`Failed to run ${hookName} hook for ${failure.plugin.name}`);
      cli.debug(failure.error.toString());
    });
    return results;
  }
}

export namespace SfHook {
  export type EnvList<T> = GenericHook<'sf:env:list', T>;
  export type EnvDisplay<T> = GenericHook<'sf:env:display', T>;
  export type Deploy<T> = GenericHook<'sf:deploy', T>;
  export type Login = Hook<'sf:login', SfHooks>;
}
