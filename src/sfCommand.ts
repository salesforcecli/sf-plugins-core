/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'os';
import { CliUx, Command, Config, HelpSection, Interfaces } from '@oclif/core';
import {
  envVars,
  Messages,
  SfProject,
  StructuredMessage,
  Lifecycle,
  Mode,
  EnvironmentVariable,
  SfError,
} from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as chalk from 'chalk';
import { Progress, Prompter, Spinner, Ux } from './ux';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');

export interface SfCommandInterface extends Interfaces.Command {
  configurationVariablesSection?: HelpSection;
  envVariablesSection?: HelpSection;
  errorCodes?: HelpSection;
}

export const StandardColors = {
  error: chalk.bold.red,
  warning: chalk.bold.yellow,
  info: chalk.dim,
  success: chalk.bold.green,
};

/**
 * A base command that provided common functionality for all sf commands.
 * Functionality includes:
 *  - JSON support
 *  - progress bars
 *  - spinners
 *  - prompts
 *  - stylized output (JSON, url, objects, headers)
 *  - lifecycle events
 *  - configuration variables help section
 *  - environment variables help section
 *  - error codes help section
 *
 * All implementations of this class need to implement the run() method.
 *
 * Additionally, all implementations of this class need to provide a generic type that describes the JSON output.
 *
 * See {@link https://github.com/salesforcecli/plugin-template-sf/blob/main/src/commands/hello/world.ts example implementation}.
 *
 * @example
 * import { SfCommand } from '@salesforce/sf-plugins-core';
 * export type MyJsonOutput = { success: boolean };
 * export default class MyCommand extends SfCommand<MyJsonOutput> {
 *   public async run(): Promise<MyJsonOutput> {
 *    return { success: true };
 *  }
 * }
 */

export abstract class SfCommand<T> extends Command {
  public static SF_ENV = 'SF_ENV';
  public static enableJsonFlag = true;
  /**
   * Add a CONFIGURATION VARIABLES section to the help output.
   *
   * @example
   * import { SfCommand, toHelpSection } from '@salesforce/sf-plugins-core';
   * import { OrgConfigProperties } from '@salesforce/core';
   * export default class MyCommand extends SfCommand {
   *   public static configurationVariablesSection = toHelpSection(
   *     'CONFIGURATION VARIABLES',
   *     OrgConfigProperties.TARGET_ORG,
   *     OrgConfigProperties.ORG_API_VERSION,
   *   );
   * }
   */
  public static configurationVariablesSection?: HelpSection;

  /**
   * Add an Environment VARIABLES section to the help output.
   *
   * @example
   * import { SfCommand, toHelpSection } from '@salesforce/sf-plugins-core';
   * import { EnvironmentVariable } from '@salesforce/core';
   * export default class MyCommand extends SfCommand {
   *   public static envVariablesSection = toHelpSection(
   *     'ENVIRONMENT VARIABLES',
   *     EnvironmentVariable.SF_TARGET_ORG,
   *     EnvironmentVariable.SF_USE_PROGRESS_BAR,
   *   );
   * }
   */
  public static envVariablesSection?: HelpSection;

  /**
   * Add an ERROR CODES section to the help output.
   *
   * @example
   * import { SfCommand, toHelpSection } from '@salesforce/sf-plugins-core';
   * export default class MyCommand extends SfCommand {
   *   public static errorCodes = toHelpSection(
   *     'ERROR CODES',
   *     { 0: 'Success', 1: 'Failure' },
   *   );
   * }
   */
  public static errorCodes?: HelpSection;

  /**
   * Flags that you can use for manipulating tables.
   *
   * @example
   * import { SfCommand } from '@salesforce/sf-plugins-core';
   * export default class MyCommand extends SfCommand {
   *   public static flags = {
   *    ...SfCommand.tableFags,
   *    'my-flags: flags.string({ char: 'm', description: 'my flag' }),
   *   }
   * }
   */
  public static tableFlags = CliUx.ux.table.flags;
  /**
   * Set to true if the command must be executed inside a Salesforce project directory.
   *
   * If set to true the command will throw an error if the command is executed outside of a Salesforce project directory.
   * Additionally, this.project will be set to the current Salesforce project (SfProject).
   *
   */
  public static requiresProject: boolean;

  /**
   * Add a spinner to the console. {@link Spinner}
   */
  public spinner: Spinner;

  /**
   * Add a progress bar to the console. {@link Progress}
   */
  public progress: Progress;
  public project!: SfProject;

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
    this.progress = new Progress(outputEnabled && envVars.getBoolean(EnvironmentVariable.SF_USE_PROGRESS_BAR, true));
    this.ux = new Ux(outputEnabled);
    this.prompter = new Prompter();
    this.lifecycle = Lifecycle.getInstance();
  }

  /**
   * Log a success message that has the standard success message color applied.
   *
   * @param message The message to log.
   */
  public logSuccess(message: string): void {
    this.log(StandardColors.success(message));
  }

  /**
   * Log warning to users. If --json is enabled, then the warning will be added to the json output under the warnings property.
   *
   * @param input {@link SfCommand.Warning} The message to log.
   */
  public warn(input: SfCommand.Warning): SfCommand.Warning {
    const colorizedArgs: string[] = [];
    this.warnings.push(input);
    const message = typeof input === 'string' ? input : input.message;

    colorizedArgs.push(`${StandardColors.warning(messages.getMessage('warning.prefix'))} ${message}`);
    colorizedArgs.push(
      ...this.formatActions(typeof input === 'string' ? [] : input.actions || [], { actionColor: StandardColors.info })
    );

    this.log(colorizedArgs.join(os.EOL));
    return input;
  }

  /**
   * Log info message to users.
   *
   * @param input {@link SfCommand.Info} The message to log.
   */
  public info(input: SfCommand.Info): void {
    const colorizedArgs: string[] = [];
    const message = typeof input === 'string' ? input : input.message;

    colorizedArgs.push(`${StandardColors.info(message)}`);
    colorizedArgs.push(
      ...this.formatActions(typeof input === 'string' ? [] : input.actions || [], { actionColor: StandardColors.info })
    );

    this.log(colorizedArgs.join(os.EOL));
  }

  /**
   * Warn user about sensitive information (access tokens, etc...) before logging to the console.
   *
   * @param msg The message to log.
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
   *
   * @param text The text to display for the url.
   * @param uri The url to display.
   */
  public url(text: string, uri: string, params = {}): void {
    this.ux.url(text, uri, params);
  }

  /**
   * Log stylized JSON to the console. Will automatically be suppressed when --json flag is present.
   *
   * @param obj The JSON to log.
   */
  public styledJSON(obj: AnyJson): void {
    this.ux.styledJSON(obj);
  }

  /**
   * Log stylized object to the console. Will automatically be suppressed when --json flag is present.
   *
   * @param obj The object to log.
   */
  public styledObject(obj: AnyJson): void {
    this.ux.styledObject(obj);
  }

  /**
   * Log stylized header to the console. Will automatically be suppressed when --json flag is present.
   *
   * @param text the text to display as a header.
   */
  public styledHeader(text: string): void {
    this.ux.styledHeader(text);
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
   * Simplified prompt for single-question confirmation. Times out and throws after 10s
   *
   * @param message text to display.  Do not include a question mark.
   * @param ms milliseconds to wait for user input.  Defaults to 10s.
   * @return true if the user confirms, false if they do not.
   */
  public async confirm(message: string, ms = 10000): Promise<boolean> {
    const { confirmed } = await this.timedPrompt<{ confirmed: boolean }>(
      [
        {
          name: 'confirmed',
          message,
          type: 'confirm',
        },
      ],
      ms
    );
    return confirmed;
  }

  /**
   * Prompt user for information with a timeout (in milliseconds). See https://www.npmjs.com/package/inquirer for more.
   */
  public async timedPrompt<R = Prompter.Answers>(
    questions: Prompter.Questions<R>,
    ms = 10_000,
    initialAnswers?: Partial<R>
  ): Promise<R> {
    return this.prompter.timedPrompt(questions, ms, initialAnswers);
  }

  public async _run<R>(): Promise<R | undefined> {
    if (this.statics.requiresProject) {
      this.project = await this.assignProject();
    }
    if (this.statics.state === 'beta') {
      this.warn(messages.getMessage('warning.CommandInBeta'));
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
  protected toErrorJson(error: SfCommand.Error): SfCommand.Error {
    return {
      ...error,
      warnings: this.warnings,
    };
  }

  protected async assignProject(): Promise<SfProject> {
    try {
      return await SfProject.resolve();
    } catch (err) {
      if (err instanceof Error && err.name === 'InvalidProjectWorkspaceError') {
        throw messages.createError('errors.RequiresProject');
      }
      throw err;
    }
  }

  protected async catch(error: Error | SfError | SfCommand.Error): Promise<SfCommand.Error> {
    // transform an unknown error into one that conforms to the interface
    const codeFromError = error instanceof SfError ? error.exitCode : 1;
    process.exitCode ??= codeFromError;
    const sfErrorProperties =
      error instanceof SfError
        ? { data: error.data, actions: error.actions, code: codeFromError, context: error.context }
        : {};
    const sfCommandError: SfCommand.Error = {
      ...sfErrorProperties,
      ...{
        message: error.message,
        name: error.name ?? 'Error',
        status: process.exitCode,
        stack: error.stack,
        exitCode: process.exitCode,
      },
    };

    if (this.jsonEnabled()) {
      CliUx.ux.styledJSON(this.toErrorJson(sfCommandError));
    } else {
      // eslint-disable-next-line no-console
      console.error(this.formatError(sfCommandError));
    }
    return sfCommandError;
  }

  /**
   * Format errors and actions for human consumption. Adds 'Error (<ErrorCode>):',
   * When there are actions, we add 'Try this:' in blue
   * followed by each action in red on its own line.
   * If Error.code is present it is output last in parentheses
   *
   * @returns {string} Returns decorated messages.
   */
  protected formatError(error: SfCommand.Error): string {
    const colorizedArgs: string[] = [];
    const errorCode = error.code ? ` (${error.code})` : '';
    const errorPrefix = `${StandardColors.error(messages.getMessage('error.prefix', [errorCode]))}`;
    colorizedArgs.push(`${errorPrefix} ${error.message}`);
    colorizedArgs.push(...this.formatActions(error.actions || []));
    if (error.stack && envVars.getString(SfCommand.SF_ENV) === Mode.DEVELOPMENT) {
      colorizedArgs.push(StandardColors.info(`\n*** Internal Diagnostic ***\n\n${error.stack}\n******\n`));
    }
    return colorizedArgs.join('\n');
  }

  /**
   * Utility function to format actions lines
   *
   * @param actions
   * @param options
   * @private
   */
  private formatActions(
    actions: string[],
    options: { actionColor: chalk.Chalk } = { actionColor: StandardColors.info }
  ): string[] {
    const colorizedArgs: string[] = [];
    // Format any actions.
    if (actions?.length) {
      colorizedArgs.push(`\n${StandardColors.info(messages.getMessage('actions.tryThis'))}\n`);
      actions.forEach((action) => {
        colorizedArgs.push(`${options.actionColor(action)}`);
      });
    }
    return colorizedArgs;
  }

  public abstract run(): Promise<T>;
}

export namespace SfCommand {
  export type Info = StructuredMessage | string;
  export type Warning = StructuredMessage | string;

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
    actions?: string[];
    code?: unknown;
    exitCode?: number;
    data?: unknown;
    context?: string;
  }
}
