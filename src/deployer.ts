/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */

import { EventEmitter } from 'events';
import { AnyJson, JsonMap } from '@salesforce/ts-types';
import { QuestionCollection, Answers } from 'inquirer';
import { CliUx } from '@oclif/core';
import { Prompter } from './ux';

export type DeployerResult = {
  exitCode: number;
};

export abstract class Deployable {
  abstract getName(): string;
  abstract getType(): string;
  abstract getPath(): string;
  abstract getParent(): Deployer;
}

/**
 * Interface for deploying Deployables.
 */
export abstract class Deployer extends EventEmitter {
  /**
   * Deployables are individual pieces that can be deployed on their own. For example,
   * each package in a salesforce project is considered a deployable that can be deployed
   * on its own.
   */
  public deployables: Deployable[] = [];
  private prompter = new Prompter();

  /**
   * Method for displaying deploy progress to the user
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function, class-methods-use-this
  public progress(current: number, total: number, message: string): void {}

  /**
   * Log messages to the console
   */
  // eslint-disable-next-line class-methods-use-this
  public log(msg?: string | undefined, ...args: string[]): void {
    CliUx.ux.log(msg, ...args);
  }

  /**
   * Prompt user for additional information
   */
  public async prompt<T extends Answers>(questions: QuestionCollection<T>, initialAnswers?: Partial<T>): Promise<T> {
    const answers = await this.prompter.prompt<T>(questions, initialAnswers);
    return answers;
  }

  /**
   * Overwrite the deployables property on the class.
   */
  public selectDeployables(deployables: Deployable[]): void {
    this.deployables = Object.assign([], deployables);
  }

  /**
   * The human readable name of the deployer
   */
  public abstract getName(): string;

  /**
   * Perform any initialization or setup. This is the time to prompt the
   * user for any needed information.
   *
   * If options are passed it, it should use those instead of prompting the for the passed in information
   *
   * Uses the returned dictionary as the information to store in the deploy-options.json file.
   */
  public abstract setup(flags: Deployer.Flags, options: Deployer.Options): Promise<Deployer.Options>;

  /**
   * Deploy the app.
   */
  public abstract deploy<R extends DeployerResult>(): Promise<void | R>;
}

export namespace Deployer {
  export type Flags = {
    interactive: boolean;
  };

  /**
   * This interface represents the aggregation of all deployer options, e.g.
   *
   * @example
   * ```
   * {
   *   'Salesforce Apps': {
   *      testLevel: 'RunLocalTests',
   *      apps: ['force-app'],
   *    },
   *   'Salesforce Functions': { username: 'user@salesforce.com' },
   * }
   * ```
   */
  export type Options<T = AnyJson> = JsonMap & {
    [key: string]: T | undefined;
  };
}
