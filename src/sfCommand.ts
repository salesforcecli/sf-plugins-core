/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { CliUx, Command, Config, HelpSection, Interfaces } from '@oclif/core';
import { Messages, SfdxProject, Lifecycle } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
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
  public static enableJsonFlag = true;
  public static configurationVariablesSection?: HelpSection;
  public static envVariablesSection?: HelpSection;
  public static errorCodes?: HelpSection;
  public static tableFlags = CliUx.ux.table.flags;
  public static requiresProject: boolean;

  public spinner: Spinner;
  public progress: Progress;
  public project!: SfdxProject;

  private warnings: SfCommand.Warning[] = [];
  private ux: Ux;
  private prompter: Prompter;
  private lifecycle: Lifecycle;

  protected get statics(): typeof SfCommand {
    return this.constructor as typeof SfCommand;
  }

  public constructor(argv: string[], config: Config) {
    super(argv, config);
    const outputEnabled = !this.jsonEnabled();
    this.spinner = new Spinner(outputEnabled);
    this.progress = new Progress(outputEnabled);
    this.ux = new Ux(outputEnabled);
    this.prompter = new Prompter();
    this.lifecycle = Lifecycle.getInstance();
  }

  /**
   * Log warning to users. If --json is enabled, then the warning
   * will be added to the json output under the warnings property.
   */
  public warn(input: SfCommand.Warning): SfCommand.Warning {
    const warning = super.warn(input) as SfCommand.Warning;
    this.warnings.push(warning);
    return input;
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

  public async _run<R>(): Promise<R | undefined> {
    if (this.statics.requiresProject) {
      this.project = await this.assignProject();
    }
    this.lifecycle.onWarning(async (warning: string) => {
      this.warn(warning);
    });
    return super._run<R>();
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

  protected async assignProject(): Promise<SfdxProject> {
    try {
      return await SfdxProject.resolve();
    } catch (err) {
      if (err instanceof Error && err.name === 'InvalidProjectWorkspaceError') {
        throw messages.createError('errors.RequiresProject');
      }
      throw err;
    }
  }

  public abstract run(): Promise<T>;
}

export namespace SfCommand {
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
