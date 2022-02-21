/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'os';
import { CliUx, Command, Config, HelpSection, Interfaces } from '@oclif/core';
import { Messages, Mode } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import chalk from 'chalk';
import { envVars } from '@salesforce/core';
import { Progress, Prompter, Spinner, Ux } from './ux';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');

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
 * @extends @oclif/core/command
 * @see https://github.com/oclif/core/blob/main/src/command.ts
 */

export abstract class SfCommand<T> extends Command {
  public static SF_ENV = 'SF_ENV';
  public static enableJsonFlag = true;
  public static configurationVariablesSection?: HelpSection;
  public static envVariablesSection?: HelpSection;
  public static errorCodes?: HelpSection;
  public static tableFlags = CliUx.ux.table.flags;

  public spinner: Spinner;
  public progress: Progress;

  private warnings: SfCommand.Warning[] = [];
  private ux: Ux;
  private prompter: Prompter;

  public constructor(argv: string[], config: Config) {
    super(argv, config);
    const outputEnabled = !this.jsonEnabled();
    this.spinner = new Spinner(outputEnabled);
    this.progress = new Progress(outputEnabled);
    this.ux = new Ux(outputEnabled);
    this.prompter = new Prompter();
  }

  /**
   * Log warning to users. If --json is enabled, then the warning
   * will be added to the json output under the warnings property.
   */
  public warn(input: SfCommand.Warning): SfCommand.Warning {
    const colorizedArgs: string[] = [];
    this.warnings.push(input);
    const message = typeof input === 'string' ? input : input.message;

    colorizedArgs.push(`${chalk.bold.yellow(messages.getMessage('warning.prefix'))} ${message}`);
    colorizedArgs.push(...this.formatActions(input as Error, { actionColor: chalk.reset }));

    this.log(colorizedArgs.join(os.EOL));
    return input;
  }

  /**
   * Log info message to users.
   */
  public info(input: SfCommand.Info): void {
    const colorizedArgs: string[] = [];
    const message = typeof input === 'string' ? input : input.message;

    colorizedArgs.push(`${chalk.bold(messages.getMessage('info.prefix'))} ${message}`);
    colorizedArgs.push(...this.formatActions(input as Error, { actionColor: chalk.reset }));

    this.log(colorizedArgs.join(os.EOL));
  }

  /**
   * Warn user about sensitive information (access tokens, etc...) before
   * logging to the console.
   */
  public logSensitive(msg?: string): void {
    this.warn(messages.getMessage('warning.security'));
    this.log(msg);
  }

  /**
   * Display a table on the console. Will automatically be suppressed when --json flag is present.
   */
  public table<R extends Ux.Table.Data>(data: R[], columns: Ux.Table.Columns<R>, options?: Ux.Table.Options): void {
    this.ux.table(data, columns, options);
  }

  /**
   * Log a stylized url to the console. Will automatically be suppressed when --json flag is present.
   */
  public url(text: string, uri: string, params = {}): void {
    this.ux.url(text, uri, params);
  }

  /**
   * Log stylized JSON to the console. Will automatically be suppressed when --json flag is present.
   */
  public styledJSON(obj: AnyJson): void {
    this.ux.styledJSON(obj);
  }

  /**
   * Log stylized object to the console. Will automatically be suppressed when --json flag is present.
   */
  public styledObject(obj: AnyJson): void {
    this.ux.styledObject(obj);
  }

  /**
   * Prompt user for information. See https://www.npmjs.com/package/inquirer for more.
   *
   * This will NOT be automatically suppressed when the --json flag is present since we assume
   * that any command that prompts the user for required information will not also support the --json flag.
   *
   * If you need to conditionally suppress prompts to support json output, then do the following:
   *
   * @example
   * if (!this.jsonEnabled()) {
   *   await this.prompt();
   * }
   */
  public async prompt<R = Prompter.Answers>(questions: Prompter.Questions<R>, initialAnswers?: Partial<R>): Promise<R> {
    return this.prompter.prompt(questions, initialAnswers);
  }

  /**
   * Wrap the command result into the standardized JSON structure.
   */
  protected toSuccessJson(result: T): SfCommand.Json<T> {
    return {
      status: process.exitCode ?? 0,
      result,
      warnings: this.warnings,
    };
  }

  /**
   * Wrap the command error into the standardized JSON structure.
   */
  protected toErrorJson(error: Error): SfCommand.Error {
    return {
      status: process.exitCode ?? 1,
      stack: error.stack,
      name: error.name,
      message: error.message,
      warnings: this.warnings,
    };
  }

  protected async catch(err: Error & { exitCode?: number }): Promise<Error & { exitCode?: number }> {
    process.exitCode = process.exitCode ?? err.exitCode ?? 1;
    this.log(this.formatError(err));
    if (this.jsonEnabled()) {
      CliUx.ux.styledJSON(this.toErrorJson(err));
    }
    return err;
  }

  /**
   * Format errors and actions for human consumption. Adds 'Error:',
   * When there are actions, we add 'Try this:' in blue
   * followed by each action in red on its own line.
   * If Error.code is present it is output last in parentheses
   *
   * @returns {string} Returns decorated messages.
   */
  protected formatError(error: Error & { actions?: string[]; code?: unknown }): string {
    const colorizedArgs: string[] = [];
    colorizedArgs.push(`${chalk.bold.red(messages.getMessage('error.prefix'))} ${error.message}`);
    colorizedArgs.push(...this.formatActions(error));
    if (error.stack && envVars.getString(SfCommand.SF_ENV) === Mode.DEVELOPMENT) {
      colorizedArgs.push(chalk.red(`\n*** Internal Diagnostic ***\n\n${error.stack}\n******\n`));
    }
    if (error.code) {
      colorizedArgs.push(chalk.bold(`\n(${error.code})`));
    }

    return colorizedArgs.join('\n');
  }

  /**
   * Utility function to format actions lines
   *
   * @param error
   * @param options
   * @private
   */
  private formatActions(
    error: (Error & { actions?: string[]; code?: unknown }) | string,
    options: { actionColor: typeof chalk } = { actionColor: chalk.red }
  ): string[] {
    const colorizedArgs: string[] = [];
    // Format any actions.
    if (typeof error !== 'string' && error.actions?.length) {
      colorizedArgs.push(`\n${chalk.blue.bold(messages.getMessage('actions.tryThis'))}\n`);
      error.actions.forEach((action) => {
        colorizedArgs.push(`${options.actionColor(action)}`);
      });
    }
    return colorizedArgs;
  }

  public abstract run(): Promise<T>;
}

export namespace SfCommand {
  export type Info = string | Error;
  export type Warning = string | Error;

  export interface Json<T> {
    status: number;
    result: T;
    warnings?: Warning[];
  }

  export interface Error {
    status: number;
    name: string;
    message: string;
    stack: string | undefined;
    warnings?: Warning[];
  }
}
