/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { EventEmitter } from 'events';
import { Dictionary, Nullable } from '@salesforce/ts-types';
import cli from 'cli-ux';
import { QuestionCollection } from 'inquirer';
import { Prompter } from './prompter';

export interface Preferences {
  interactive: boolean;
}

export type Options = Dictionary<string>;

export abstract class Deployable {
  abstract getAppName(): string;
  abstract getAppType(): string;
  abstract getAppPath(): string;
  abstract getEnvType(): Nullable<string>;
  abstract getParent(): Deployer;
}

/**
 * Deploy a piece of a project.
 */
export abstract class Deployer extends EventEmitter {
  public deployables: Deployable[] = [];
  private prompter = new Prompter();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public progress(current: number, total: number, message: string): void {}

  public log(msg: string | undefined, ...args: string[]): void {
    cli.log(msg, ...args);
  }

  public async prompt<T>(questions: QuestionCollection<T>, initialAnswers?: Partial<T>): Promise<T> {
    const answers = await this.prompter.prompt<T>(questions, initialAnswers);
    return answers;
  }

  public selectDeployables(deployables: Deployable[]): void {
    this.deployables = Object.assign([], deployables);
  }

  /**
   * Perform any initialization or setup. This is the time to prompt the
   * user for any needed information. It should do so by respecting the user's
   * preferences when possible (i.e. interactive mode or wait times).
   *
   * If options are passed it, it should use those instead of prompting the for the passed in information
   *
   * Uses the returned dictionary as the information to store in the project-deploy-options.json file.
   */
  public abstract setup(preferences: Preferences, options?: Dictionary<string>): Promise<Dictionary<string>>;

  /**
   * Deploy the app.
   */
  public abstract deploy(): Promise<void>;
}
