/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import os from 'node:os';
import { Errors, Command, Config, HelpSection, Flags } from '@oclif/core';
import {
  envVars,
  Messages,
  SfProject,
  Lifecycle,
  EnvironmentVariable,
  SfError,
  ConfigAggregator,
  StructuredMessage,
} from '@salesforce/core';
import type { AnyJson } from '@salesforce/ts-types';
import { Progress } from './ux/progress.js';
import { Spinner } from './ux/spinner.js';
import { Ux } from './ux/ux.js';
import { SfCommandError } from './SfCommandError.js';
import { formatActions, formatError } from './errorFormatting.js';
import { StandardColors } from './ux/standardColors.js';
import { confirm, secretPrompt, PromptInputs } from './ux/prompts.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/sf-plugins-core', 'messages');

export type SfCommandInterface = {
  configurationVariablesSection?: HelpSection;
  envVariablesSection?: HelpSection;
  errorCodes?: HelpSection;
} & Command.Class;

/**
 * A base command that provided common functionality for all sf commands.
 * Functionality includes:
 * - JSON support
 * - progress bars
 * - spinners
 * - prompts
 * - stylized output (JSON, url, objects, headers)
 * - lifecycle events
 * - configuration variables help section
 * - environment variables help section
 * - error codes help section
 *
 * All implementations of this class need to implement the run() method.
 *
 * Additionally, all implementations of this class need to provide a generic type that describes the JSON output.
 *
 * See {@link https://github.com/salesforcecli/plugin-template-sf/blob/main/src/commands/hello/world.ts example implementation}.
 *
 * @example
 *
 * ```
 * import { SfCommand } from '@salesforce/sf-plugins-core';
 * export type MyJsonOutput = { success: boolean };
 * export default class MyCommand extends SfCommand<MyJsonOutput> {
 *   public async run(): Promise<MyJsonOutput> {
 *    return { success: true };
 *  }
 * }
 * ```
 */

export abstract class SfCommand<T> extends Command {
  public static enableJsonFlag = true;
  /**
   * Add a CONFIGURATION VARIABLES section to the help output.
   *
   * @example
   * ```
   * import { SfCommand, toHelpSection } from '@salesforce/sf-plugins-core';
   * import { OrgConfigProperties } from '@salesforce/core';
   * export default class MyCommand extends SfCommand {
   *   public static configurationVariablesSection = toHelpSection(
   *     'CONFIGURATION VARIABLES',
   *     OrgConfigProperties.TARGET_ORG,
   *     OrgConfigProperties.ORG_API_VERSION,
   *   );
   * }
   * ```
   */
  public static configurationVariablesSection?: HelpSection;

  /**
   * Add an Environment VARIABLES section to the help output.
   *
   * @example
   * ```
   * import { SfCommand, toHelpSection } from '@salesforce/sf-plugins-core';
   * import { EnvironmentVariable } from '@salesforce/core';
   * export default class MyCommand extends SfCommand {
   *   public static envVariablesSection = toHelpSection(
   *     'ENVIRONMENT VARIABLES',
   *     EnvironmentVariable.SF_TARGET_ORG,
   *     EnvironmentVariable.SF_USE_PROGRESS_BAR,
   *   );
   * }
   * ```
   */
  public static envVariablesSection?: HelpSection;

  /**
   * Add an ERROR CODES section to the help output.
   *
   * @example
   * ```
   * import { SfCommand, toHelpSection } from '@salesforce/sf-plugins-core';
   * export default class MyCommand extends SfCommand {
   *   public static errorCodes = toHelpSection(
   *     'ERROR CODES',
   *     { 0: 'Success', 1: 'Failure' },
   *   );
   * }
   * ```
   */
  public static errorCodes?: HelpSection;

  public static baseFlags = {
    'flags-dir': Flags.directory({
      summary: messages.getMessage('flags.flags-dir.summary'),
      helpGroup: 'GLOBAL',
    }),
  };

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
  public project?: SfProject;

  /**
   * ConfigAggregator instance for accessing global and local configuration.
   */
  public configAggregator!: ConfigAggregator;

  private warnings: SfCommand.Warning[] = [];
  private ux: Ux;
  private lifecycle: Lifecycle;

  public constructor(argv: string[], config: Config) {
    super(argv, config);
    this.ux = new Ux({ jsonEnabled: this.jsonEnabled() });
    this.progress = new Progress(
      this.ux.outputEnabled && envVars.getBoolean(EnvironmentVariable.SF_USE_PROGRESS_BAR, true)
    );
    this.spinner = this.ux.spinner;
    this.lifecycle = Lifecycle.getInstance();
  }

  protected get statics(): typeof SfCommand {
    return this.constructor as typeof SfCommand;
  }

  public jsonEnabled(): boolean {
    // https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_dev_cli_json_support.htm
    // can come from either oclif's detection of the flag's presence and truthiness OR from the env
    // unless it's been explicitly disabled on the command's statics
    return (
      super.jsonEnabled() ||
      (this.statics.enableJsonFlag !== false &&
        envVars.getString(EnvironmentVariable.SF_CONTENT_TYPE)?.toUpperCase() === 'JSON')
    );
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
    this.warnings.push(input);
    const message = typeof input === 'string' ? input : input.message;

    const colorizedArgs = [
      `${StandardColors.warning(messages.getMessage('warning.prefix'))} ${message}`,
      ...formatActions(typeof input === 'string' ? [] : input.actions ?? []),
    ];

    this.logToStderr(colorizedArgs.join(os.EOL));
    return input;
  }

  /**
   * Log info message to users.
   *
   * @param input {@link SfCommand.Info} The message to log.
   */
  public info(input: SfCommand.Info): void {
    const message = typeof input === 'string' ? input : input.message;
    this.log(
      [`${StandardColors.info(message)}`, ...formatActions(typeof input === 'string' ? [] : input.actions ?? [])].join(
        os.EOL
      )
    );
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
    this.ux.styledJSON(obj, this.config.theme?.json);
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

  // leaving AnyJson and unknown to maintain the public API.
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-redundant-type-constituents
  public logJson(json: AnyJson | unknown): void {
    // If `--json` is enabled, then the ux instance on the class will disable output, which
    // means that the logJson method will not output anything. So, we need to create a new
    // instance of the ux class that does not have output disabled in order to log the json.
    new Ux().styledJSON(json as AnyJson, this.config.theme?.json);
  }

  /**
   * Prompt user for yes/no confirmation.
   * Avoid calling in --json scenarios and always provide a `--no-prompt` option for scripting
   *
   * @param message text to display.  Do not include a question mark.
   * @param ms milliseconds to wait for user input.  Defaults to 60s.  Will throw an error when timeout is reached.
   *
   */

  // eslint-disable-next-line class-methods-use-this
  public async secretPrompt({ message, ms = 60_000 }: PromptInputs<string>): Promise<string> {
    return secretPrompt({ message, ms });
  }

  /**
   * Prompt user for yes/no confirmation.
   * Avoid calling in --json scenarios and always provide a `--no-prompt` option for scripting
   *
   * @param message text to display.  Do not include a question mark or Y/N.
   * @param ms milliseconds to wait for user input.  Defaults to 10s.  Will use the default value when timeout is reached.
   * @param defaultAnswer boolean to set the default answer to.  Defaults to false.
   *
   */

  // eslint-disable-next-line class-methods-use-this
  public async confirm({ message, ms = 10_000, defaultAnswer = false }: PromptInputs<boolean>): Promise<boolean> {
    return confirm({ message, ms, defaultAnswer });
  }

  public async _run<R>(): Promise<R> {
    ['SIGINT', 'SIGTERM', 'SIGBREAK', 'SIGHUP'].map((listener) => {
      process.on(listener, () => {
        this.exit(130);
      });
    });

    [this.configAggregator, this.project] = await Promise.all([
      ConfigAggregator.create(),
      ...(this.statics.requiresProject ? [assignProject()] : []),
    ]);

    if (this.statics.state === 'beta') {
      this.warn(messages.getMessage('warning.CommandInBeta'));
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    this.lifecycle.onWarning(async (warning: string) => {
      this.warn(warning);
    });
    const options = {
      Command: this.ctor,
      argv: this.argv,
      commandId: this.id,
    };
    // what hooks are there in the plugins?  Subscribe to matching lifecycle events
    this.config
      .getPluginsList()
      // omit oclif and telemetry (which subscribes itself to events already)
      .filter((plugin) => !plugin.name.startsWith('@oclif/') && plugin.name !== '@salesforce/plugin-telemetry')
      .flatMap((p) => Object.entries(p.hooks))
      .map(([eventName, hooksForEvent]) => {
        hooksForEvent.map(() => {
          this.lifecycle.on(eventName, async (result: AnyJson) => {
            await this.config.runHook(eventName, Object.assign(options, { result }));
          });
        });
      });

    // eslint-disable-next-line no-underscore-dangle
    return super._run<R>();
  }

  /**
   * Wrap the command result into the standardized JSON structure.
   */
  protected toSuccessJson(result: T): SfCommand.Json<T> {
    return {
      status: typeof process.exitCode === 'number' ? process.exitCode : 0,
      result,
      warnings: this.warnings,
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async catch(error: Error | SfError | Errors.CLIError): Promise<never> {
    // stop any spinners to prevent it from unintentionally swallowing output.
    // If there is an active spinner, it'll say "Error" instead of "Done"
    this.spinner.stop(StandardColors.error('Error'));

    // transform an unknown error into a SfCommandError
    const sfCommandError = SfCommandError.from(error, this.statics.name, this.warnings);
    process.exitCode = sfCommandError.exitCode;

    // no var args (strict = true || undefined), and unexpected arguments when parsing
    if (
      this.statics.strict !== false &&
      sfCommandError.exitCode === 2 &&
      error.message.includes('Unexpected argument')
    ) {
      sfCommandError.appendErrorSuggestions();
    }

    if (this.jsonEnabled()) {
      this.logJson(sfCommandError.toJson());
    } else {
      this.logToStderr(formatError(sfCommandError));
    }

    // Emit an event for plugin-telemetry prerun hook to pick up.
    // @ts-expect-error because TS is strict about the events that can be emitted on process.
    process.emit('sfCommandError', sfCommandError, this.id);

    throw sfCommandError;
  }

  public abstract run(): Promise<T>;
}

const assignProject = async (): Promise<SfProject> => {
  try {
    return await SfProject.resolve();
  } catch (err) {
    if (err instanceof Error && err.name === 'InvalidProjectWorkspaceError') {
      throw messages.createError('errors.RequiresProject');
    }
    throw err;
  }
};

export namespace SfCommand {
  export type Info = StructuredMessage | string;
  export type Warning = StructuredMessage | string;

  export type Json<T> = {
    status: number;
    result: T;
    warnings?: Warning[];
  };
  export type Error = SfCommandError;
}
