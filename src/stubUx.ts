/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SinonSandbox } from 'sinon';
import { SfCommand } from './sfCommand';
import { Prompter, Spinner, Ux } from './ux';

export function stubUx(sandbox: SinonSandbox) {
  return {
    log: sandbox.stub(Ux.prototype, 'log'),
    warn: sandbox.stub(Ux.prototype, 'warn'),
    table: sandbox.stub(Ux.prototype, 'table'),
    url: sandbox.stub(Ux.prototype, 'url'),
    styledHeader: sandbox.stub(Ux.prototype, 'styledHeader'),
    styledObject: sandbox.stub(Ux.prototype, 'styledObject'),
    styledJSON: sandbox.stub(Ux.prototype, 'styledJSON'),
  };
}

export function stubSfCommandUx(sandbox: SinonSandbox) {
  return {
    log: sandbox.stub(SfCommand.prototype, 'log'),
    logToStderr: sandbox.stub(SfCommand.prototype, 'logToStderr'),
    logSuccess: sandbox.stub(SfCommand.prototype, 'logSuccess'),
    logSensitive: sandbox.stub(SfCommand.prototype, 'logSensitive'),
    info: sandbox.stub(SfCommand.prototype, 'info'),
    warn: sandbox.stub(SfCommand.prototype, 'warn'),
    table: sandbox.stub(SfCommand.prototype, 'table'),
    url: sandbox.stub(SfCommand.prototype, 'url'),
    styledHeader: sandbox.stub(SfCommand.prototype, 'styledHeader'),
    styledObject: sandbox.stub(SfCommand.prototype, 'styledObject'),
    styledJSON: sandbox.stub(SfCommand.prototype, 'styledJSON'),
  };
}

export function stubSpinner(sandbox: SinonSandbox) {
  return {
    start: sandbox.stub(Spinner.prototype, 'start'),
    stop: sandbox.stub(Spinner.prototype, 'stop'),
  };
}

export function stubPrompter(sandbox: SinonSandbox) {
  return {
    prompt: sandbox.stub(Prompter.prototype, 'prompt'),
    confirm: sandbox.stub(Prompter.prototype, 'confirm'),
    timedPrompt: sandbox.stub(Prompter.prototype, 'timedPrompt'),
  };
}
