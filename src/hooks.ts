/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Interfaces } from '@oclif/core';
import { Duration, env } from '@salesforce/kit';
import { ux } from '@oclif/core';
import { Deployer } from './deployer';
import { EnvList, EnvDisplay, JsonObject, Deploy, Login, Logout } from './types';
import { Deauthorizer } from './deauthorizer';

/**
 * Interface that defines the well known Unified CLI command hooks.
 */
interface SfHooks<T = unknown> extends Interfaces.Hooks {
  'sf:env:list': EnvList.HookMeta<T & JsonObject>;
  'sf:env:display': EnvDisplay.HookMeta<T & JsonObject>;
  'sf:deploy': Deploy.HookMeta<T & Deployer>;
  'sf:login': Login.HookMeta;
  'sf:logout': Logout.HookMeta<T & Deauthorizer>;
}

type GenericHook<T extends keyof SfHooks, P> = Interfaces.Hook<T, SfHooks<P>>;

/**
 * Class that provides a static method to run a pre-defined sf hook. See {@link SfHooks}.
 */
export class SfHook {
  /**
   * Executes a well known Unified CLI hook. See {@link SfHooks}.
   */
  public static async run<T extends keyof SfHooks>(
    config: Interfaces.Config,
    hookName: T,
    options: SfHooks[T]['options'] = {}
  ): Promise<Interfaces.Hook.Result<SfHooks[T]['return']>> {
    const timeout = Duration.milliseconds(env.getNumber('SF_HOOK_TIMEOUT_MS') ?? 5000);
    const results = await config.runHook<T>(hookName, options, timeout.milliseconds, true);
    results.failures.forEach((failure) => {
      ux.debug(`Failed to run ${hookName} hook for ${failure.plugin.name}`);
      ux.debug(failure.error.toString());
    });
    return results;
  }
}

export namespace SfHook {
  export type EnvList<T> = GenericHook<'sf:env:list', T>;
  export type EnvDisplay<T> = GenericHook<'sf:env:display', T>;
  export type Deploy<T> = GenericHook<'sf:deploy', T>;
  export type Login = Interfaces.Hook<'sf:login', SfHooks>;
  export type Logout = Interfaces.Hook<'sf:logout', SfHooks>;
}
