/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Command as NSCommand } from '@oclif/core/lib/interfaces';
import { Answers, Question } from 'inquirer';
import { getNumber } from '@salesforce/ts-types';
import { Prompter } from './ux';
import { SfCommand } from './sfCommand';
import { MappedArgsAndFlags } from './types';

const alwaysValid = (): boolean | string | Promise<boolean | string> => true;
const required = (input: unknown): boolean | string | Promise<boolean | string> => !!input;

export class InquireScript<T extends SfCommand<unknown>> {
  public constructor(private command: T, private commandMappedArgsAndFlags: MappedArgsAndFlags[]) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  public async run(): Promise<Prompter.Answers> {
    const commandConfig = this.command.config.findCommand(this.command.id!, { must: true });
    const argDefinitions = commandConfig.args;
    // sort flags so that flags that depend on another flag appear after the dependent flag
    const flagDefinitions = this.getFlagDefinitions(commandConfig);
    const script: Question[] = [
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-assignment
      ...argDefinitions?.map((arg) => this.argQuestion(arg)),
      ...flagDefinitions?.map((flag) => this.flagQuestion(flag)),
    ];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
    const prompter = new Prompter();
    return prompter.prompt(script);
  }

  protected getFlagDefinitions(commandConfig: NSCommand.Plugin): Array<[string, NSCommand.Flag]> {
    return Object.entries(commandConfig.flags)
      .filter(([name]) => name !== 'interactive')
      .sort((l, r) => {
        const [, leftFlag] = l;
        const [, rightFlag] = r;
        // left has depends on and right does not: left > right
        if (leftFlag.dependsOn && !rightFlag.dependsOn) return 1;
        return 0;
      });
  }
  protected argQuestion(arg: NSCommand.Arg): Question {
    const argFromCommand = this.commandMappedArgsAndFlags.find((m) => m.argType === 'arg' && m.name === arg.name);
    const question = {
      name: `arg-${arg.name}`,
      type: arg.hidden ? 'password' : arg.options ? 'list' : 'input',
      message: arg.description ?? `Enter value for arg ${arg.name}`,
      default: argFromCommand?.value || arg.default,
      validate: arg.required ? required : alwaysValid,
      choices: arg.options,
    };
    return question;
  }
  protected flagQuestion(flag: [string, NSCommand.Flag.Boolean | NSCommand.Flag.Option]): Question {
    const [name, props] = flag;
    const flagFromCommand = this.commandMappedArgsAndFlags.find((m) => m.argType === 'flag' && m.name === name);
    const question = {
      name: `flag-${name}`,
      type: this.getFlagQuestionType(props),
      message: this.getFlagMessage(props, name),
      default: flagFromCommand?.value || this.getFlagDefault(props),
      validate: props.required ? required : alwaysValid,
      choices: this.getFlagChoices(props),
      // The property when determines if a questions should be prompted for
      // In this case we are looking at the current flag's exclusive or dependsOn properties and if either is present
      // check to see if any of flag entries flags have already been entered.
      // If found in the exclusive list, the current flag's entry will be skipped and
      // if in the dependsOn property the flag will be prompted for.
      when: ((): ((answers: Answers) => boolean) => {
        return (answers: Answers): boolean => {
          if ((props?.exclusive && props.exclusive.length > 0) || (props?.dependsOn && props.dependsOn.length > 0)) {
            return (
              !props.exclusive?.some((f: string) => {
                const flagName = `flag-${f}`;
                return !!answers[flagName] && getNumber(answers[flagName], 'length', 0) !== 0;
              }) ||
              props.dependsOn?.some((f: string) => {
                const flagName = `flag-${f}`;
                return !!answers[flagName] && getNumber(answers[flagName], 'length', 0) !== 0;
              }) ||
              true
            );
          } else {
            return true;
          }
        };
      })(),
    };
    return question;
  }

  protected getFlagMessage(props: NSCommand.Flag.Boolean | NSCommand.Flag.Option, name: string): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
    const exclusiveOf = (p: NSCommand.Flag.Boolean | NSCommand.Flag.Option): string =>
      p.exclusive ? ` (exclusive of: [${p.exclusive.join(',')}])` : '';
    let message = props.description || `Enter value for ${name}`;
    message = `${message}${exclusiveOf(props)}`;
    return message;
  }

  protected getFlagQuestionType(flag: NSCommand.Flag.Boolean | NSCommand.Flag.Option): string {
    if (flag.type === 'boolean') {
      if (flag.hidden) {
        return 'hidden';
      }
      return 'confirm';
    }
    if (flag.options) {
      return 'list';
    }
    if (flag.hidden) {
      return 'password';
    }
    return 'input';
  }

  private getFlagDefault(flag: NSCommand.Flag.Boolean | NSCommand.Flag.Option): unknown {
    if (flag.type === 'boolean') {
      return false;
    }
    return flag.default;
  }

  private getFlagChoices(flag: NSCommand.Flag.Boolean | NSCommand.Flag.Option): string[] {
    if (flag.type === 'boolean') {
      return [];
    }
    return flag.options || [];
  }
}
