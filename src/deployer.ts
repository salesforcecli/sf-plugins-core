/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { EventEmitter } from 'events';
import { JsonMap, Nullable } from '@salesforce/ts-types';
import cli from 'cli-ux';
import { QuestionCollection } from 'inquirer';
import { Prompter } from './prompter';

export interface Preferences {
  interactive: boolean;
}

export type DeployerOptions = JsonMap;

/**
 * This interface represents the aggregation of all deployer options, e.g.
 * {
 *   'Salesforce Apps': {
 *      testLevel: 'RunLocalTests',
 *      apps: ['force-app'],
 *    },
 *   'Salesforce Functions': { username: 'user@salesforce.com' },
 * }
 */
export interface DeployOptions<T extends DeployerOptions = DeployerOptions> {
  [key: string]: T;
}

export abstract class Deployable {
  abstract getAppName(): string;
  abstract getAppType(): string;
  abstract getAppPath(): string;
  abstract getEnvType(): Nullable<string>;
  abstract getParent(): Deployer;
}

/**
 * Interface for deploying Salesforce Org metadata.
 */
export abstract class Deployer extends EventEmitter {
  /**
   * Deployables are individual pieces that can be deployed on their own. For example,
   * each pacakge in a salesforce project is considered a deployable that can be deployed
   * on its own.
   */
  public deployables: Deployable[] = [];
  private prompter = new Prompter();

  /**
   * Method for displaying deploy progress to the user
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public progress(current: number, total: number, message: string): void {}

  /**
   * Log messages to the console
   */
  public log(msg?: string | undefined, ...args: string[]): void {
    cli.log(msg, ...args);
  }

  /**
   * Prompt user for additional information
   */
  public async prompt<T>(questions: QuestionCollection<T>, initialAnswers?: Partial<T>): Promise<T> {
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
   * user for any needed information. It should do so by respecting the user's
   * preferences when possible (i.e. interactive mode or wait times).
   *
   * If options are passed it, it should use those instead of prompting the for the passed in information
   *
   * Uses the returned dictionary as the information to store in the deploy-options.json file.
   */
  public abstract setup(preferences: Preferences, options: DeployerOptions): Promise<DeployerOptions>;

  /**
   * Deploy the app.
   */
  public abstract deploy(): Promise<void>;
}
