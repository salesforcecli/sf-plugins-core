/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Command, HelpSection, Interfaces } from '@oclif/core';

export interface SfCommandInterface extends Interfaces.Command {
  configurationVariablesSection?: HelpSection;
  envVariablesSection?: HelpSection;
  errorCodes?: HelpSection;
}

/**
 * A base command that provides convenient access to CLI help
 * output formatting. Extend this command and set specific properties
 * to add help sections to the command's help output.
 *
 * @extends @oclif/command
 * @see https://github.com/oclif/command
 */

export abstract class SfCommand<T> extends Command {
  public static enableJsonFlag = true;
  public static configurationVariablesSection?: HelpSection;
  public static envVariablesSection?: HelpSection;
  public static errorCodes?: HelpSection;

  protected toSuccessJson(result: T): SfCommand.Json<T> {
    return {
      status: process.exitCode ?? 0,
      result,
    };
  }

  protected toErrorJson(error: Error): SfCommand.Error {
    return {
      status: process.exitCode ?? 1,
      stack: error.stack,
      name: error.name,
      message: error.message,
    };
  }

  public abstract run(): Promise<T>;
}

export namespace SfCommand {
  export interface Json<T> {
    status: number;
    result: T;
    warnings?: string[];
  }

  export interface Error {
    status: number;
    name: string;
    message: string;
    stack: string | undefined;
    warnings?: string[];
  }
}
